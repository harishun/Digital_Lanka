package com.digitallanka.backend.service;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.DrivingLicenceResponse;
import com.digitallanka.backend.dto.LicenceVehicleClassResponse;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import com.digitallanka.backend.model.Notification;
import com.digitallanka.backend.model.VehicleAuthorization;
import com.digitallanka.backend.repository.NotificationRepository;
import com.digitallanka.backend.repository.VehicleAuthorizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthorizationService {

    @Autowired
    private VehicleAuthorizationRepository authorizationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private GovApiClient govApiClient;

    @Transactional
    public VehicleAuthorization createInvitation(
            String ownerNic,
            String vehicleId,
            String targetNic,
            VehicleAuthorization.AccessType accessType,
            LocalDateTime startTime,
            LocalDateTime endTime) {

        // 1. Verify vehicle exists in DMT database and belongs to the owner
        VehicleRegistrationResponse vehicle = govApiClient.getVehicleByPlate(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found in government records."));
        if (!vehicle.getOwnerNic().equals(ownerNic)) {
            throw new IllegalStateException("Only the registered owner can authorize other drivers.");
        }

        // 2. Prevent duplicate active or pending authorizations
        boolean alreadyPending = authorizationRepository.findByVehicleIdAndAuthorizedNicAndStatus(
                vehicleId, targetNic, VehicleAuthorization.Status.PENDING).isPresent();
        boolean alreadyGranted = authorizationRepository.findByVehicleIdAndAuthorizedNicAndStatus(
                vehicleId, targetNic, VehicleAuthorization.Status.GRANTED).isPresent();
        if (alreadyPending || alreadyGranted) {
            throw new IllegalStateException("This driver already has active or pending access to this vehicle.");
        }

        // 3. Enforce max 10 active/pending authorizations limit
        long activeCount = authorizationRepository.countByVehicleIdAndStatusIn(
                vehicleId, List.of(VehicleAuthorization.Status.GRANTED, VehicleAuthorization.Status.PENDING));
        if (activeCount >= 10) {
            throw new IllegalStateException("Maximum driver authorization limit (10) reached for this vehicle.");
        }

        // 4. Verify target driver has a valid DMT licence for the vehicle class
        DrivingLicenceResponse licence = govApiClient.getDrivingLicenceByNic(targetNic)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Target driver does not have a driving licence in government records."));

        boolean hasValidClass = false;
        if (licence.getVehicleClasses() != null) {
            for (LicenceVehicleClassResponse lvc : licence.getVehicleClasses()) {
                if (lvc.getClassCode().equalsIgnoreCase(vehicle.getVehicleClass())) {
                    LocalDate expiryDate = LocalDate.parse(lvc.getExpiryDate());
                    if (expiryDate.isAfter(LocalDate.now())) {
                        hasValidClass = true;
                        break;
                    }
                }
            }
        }
        if (!hasValidClass) {
            throw new IllegalArgumentException(
                    "Target driver does not have a valid, active driving licence for vehicle class "
                            + vehicle.getVehicleClass() + ".");
        }

        // 5. Create PENDING authorization
        VehicleAuthorization auth = new VehicleAuthorization();
        auth.setId(UUID.randomUUID().toString());
        auth.setVehicleId(vehicleId);
        auth.setOwnerNic(ownerNic);
        auth.setAuthorizedNic(targetNic);
        auth.setAccessType(accessType);
        auth.setStartTime(startTime);
        auth.setEndTime(endTime);
        auth.setStatus(VehicleAuthorization.Status.PENDING);
        authorizationRepository.save(auth);

        // 6. Send invitation notification to target driver
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setRecipientNic(targetNic);
        notification.setTitle("New Driving Authorization Invitation");
        notification.setMessage("Vehicle owner " + ownerNic
                + " has invited you to drive vehicle " + vehicle.getPlateNumber() + ".");
        notification.setType(Notification.Type.INVITATION);
        notification.setReferenceId(auth.getId());
        notification.setRead(false);
        notificationRepository.save(notification);

        return auth;
    }

    @Transactional
    public VehicleAuthorization respondToInvitation(String driverNic, String authorizationId, boolean accept) {
        VehicleAuthorization auth = authorizationRepository.findById(authorizationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found."));

        if (!auth.getAuthorizedNic().equals(driverNic)) {
            throw new IllegalStateException("You are not authorized to respond to this invitation.");
        }
        if (auth.getStatus() != VehicleAuthorization.Status.PENDING) {
            throw new IllegalStateException("Invitation is already resolved.");
        }

        auth.setStatus(accept ? VehicleAuthorization.Status.GRANTED : VehicleAuthorization.Status.DECLINED);
        VehicleAuthorization savedAuth = authorizationRepository.save(auth);

        // Mark related invitation notifications as read
        List<Notification> invitationNotifs = notificationRepository
                .findByRecipientNicAndReferenceId(driverNic, authorizationId);
        for (Notification notif : invitationNotifs) {
            notif.setRead(true);
            notificationRepository.save(notif);
        }

        // Resolve plate number for the notification message via DMT API
        String plateNumber = govApiClient.getVehicleByPlate(auth.getVehicleId())
                .map(VehicleRegistrationResponse::getPlateNumber)
                .orElse(auth.getVehicleId());

        // Notify the vehicle owner of the response
        Notification ownerNotif = new Notification();
        ownerNotif.setId(UUID.randomUUID().toString());
        ownerNotif.setRecipientNic(auth.getOwnerNic());
        ownerNotif.setTitle("Invitation " + (accept ? "Accepted" : "Declined"));
        ownerNotif.setMessage("Driver " + driverNic + " has "
                + (accept ? "accepted" : "declined")
                + " your invitation to drive vehicle " + plateNumber + ".");
        ownerNotif.setType(Notification.Type.GENERAL);
        ownerNotif.setReferenceId(auth.getId());
        ownerNotif.setRead(false);
        notificationRepository.save(ownerNotif);

        return savedAuth;
    }

    @Transactional
    public VehicleAuthorization revokeAuthorization(String ownerNic, String authorizationId) {
        VehicleAuthorization auth = authorizationRepository.findById(authorizationId)
                .orElseThrow(() -> new IllegalArgumentException("Authorization record not found."));

        if (!auth.getOwnerNic().equals(ownerNic)) {
            throw new IllegalStateException("Only the vehicle owner can revoke driver authorizations.");
        }

        auth.setStatus(VehicleAuthorization.Status.REVOKED);
        VehicleAuthorization savedAuth = authorizationRepository.save(auth);

        // Resolve plate number for the notification message via DMT API
        String plateNumber = govApiClient.getVehicleByPlate(auth.getVehicleId())
                .map(VehicleRegistrationResponse::getPlateNumber)
                .orElse(auth.getVehicleId());

        // Notify the driver that their access has been revoked
        Notification driverNotif = new Notification();
        driverNotif.setId(UUID.randomUUID().toString());
        driverNotif.setRecipientNic(auth.getAuthorizedNic());
        driverNotif.setTitle("Access Revoked");
        driverNotif.setMessage("Your authorization to drive vehicle " + plateNumber
                + " has been revoked by the owner.");
        driverNotif.setType(Notification.Type.GENERAL);
        driverNotif.setReferenceId(auth.getId());
        driverNotif.setRead(false);
        notificationRepository.save(driverNotif);

        return savedAuth;
    }
}
