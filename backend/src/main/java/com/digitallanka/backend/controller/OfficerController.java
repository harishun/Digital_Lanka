package com.digitallanka.backend.controller;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import com.digitallanka.backend.model.TheftCase;
import com.digitallanka.backend.model.VehicleAuthorization;
import com.digitallanka.backend.repository.VehicleAuthorizationRepository;
import com.digitallanka.backend.service.StolenTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    @Autowired
    private StolenTrackingService stolenTrackingService;

    @Autowired
    private GovApiClient govApiClient;

    @Autowired
    private VehicleAuthorizationRepository authorizationRepository;

    @Autowired
    private com.digitallanka.backend.repository.NotificationRepository notificationRepository;

    @PostMapping("/vehicles/{id}/recovered")
    public ResponseEntity<?> markRecovered(
            @PathVariable("id") String vehicleId,
            @RequestBody RecoveryRequest request) {

        String officerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            TheftCase theft = stolenTrackingService.markRecovered(officerNic, vehicleId, request.getRemarks());
            return ResponseEntity.ok(theft);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/compliance/check")
    public ResponseEntity<?> runComplianceCheck(
            @RequestParam("plateNumber") String plateNumber,
            @RequestParam(value = "driverNic", required = false) String driverNic) {

        // 1. Look up vehicle from DMT government database
        VehicleRegistrationResponse vehicle = govApiClient.getVehicleByPlate(plateNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Vehicle with plate " + plateNumber + " not found in government records."));

        // 2. Check if vehicle is currently reported stolen via TheftCase
        if (stolenTrackingService.isStolenVehicle(vehicle.getPlateNumber())) {
            return ResponseEntity.ok(new ComplianceResponse(
                    vehicle.getPlateNumber(),
                    "STOLEN",
                    "Stolen Vehicle — Detain Driver",
                    vehicle.getOwnerNic(),
                    false
            ));
        }

        // 3. If no driver specified, return active status only
        if (driverNic == null || driverNic.trim().isEmpty()) {
            return ResponseEntity.ok(new ComplianceResponse(
                    vehicle.getPlateNumber(),
                    "ACTIVE",
                    "No driver queried",
                    vehicle.getOwnerNic(),
                    true
            ));
        }

        // 4. Check if driver is the registered owner
        if (vehicle.getOwnerNic().equals(driverNic)) {
            return ResponseEntity.ok(new ComplianceResponse(
                    vehicle.getPlateNumber(),
                    "ACTIVE",
                    "AUTHORIZED (Owner)",
                    vehicle.getOwnerNic(),
                    true
            ));
        }

        // 5. Check for active driver authorization
        Optional<VehicleAuthorization> activeAuthOpt = authorizationRepository
                .findByVehicleIdAndAuthorizedNicAndStatus(
                        vehicle.getPlateNumber(), driverNic, VehicleAuthorization.Status.GRANTED);

        if (activeAuthOpt.isEmpty()) {
            // Save unauthorized driving alert notification to the vehicle owner
            com.digitallanka.backend.model.Notification alertNotif = new com.digitallanka.backend.model.Notification();
            alertNotif.setId(java.util.UUID.randomUUID().toString());
            alertNotif.setRecipientNic(vehicle.getOwnerNic());
            alertNotif.setTitle("Unauthorized Driver Alert");
            alertNotif.setMessage("Roadside Law Enforcement inspection detected driver " + driverNic
                    + " operating your vehicle " + vehicle.getPlateNumber() + " without authorization.");
            alertNotif.setType(com.digitallanka.backend.model.Notification.Type.STOLEN_ALERT);
            alertNotif.setRead(false);
            notificationRepository.save(alertNotif);

            return ResponseEntity.ok(new ComplianceResponse(
                    vehicle.getPlateNumber(),
                    "ACTIVE",
                    "Unauthorized Driver",
                    vehicle.getOwnerNic(),
                    false
            ));
        }

        VehicleAuthorization auth = activeAuthOpt.get();

        // 6. If time-bound, verify the authorization window is currently active
        if (auth.getAccessType() == VehicleAuthorization.AccessType.TIME_BOUND) {
            LocalDateTime now = LocalDateTime.now();
            if ((auth.getStartTime() != null && now.isBefore(auth.getStartTime()))
                    || (auth.getEndTime() != null && now.isAfter(auth.getEndTime()))) {

                auth.setStatus(VehicleAuthorization.Status.EXPIRED);
                authorizationRepository.save(auth);

                com.digitallanka.backend.model.Notification alertNotif = new com.digitallanka.backend.model.Notification();
                alertNotif.setId(java.util.UUID.randomUUID().toString());
                alertNotif.setRecipientNic(vehicle.getOwnerNic());
                alertNotif.setTitle("Expired Driver Authorization Alert");
                alertNotif.setMessage("Roadside Law Enforcement inspection detected driver " + driverNic
                        + " operating your vehicle " + vehicle.getPlateNumber()
                        + " with an expired authorization.");
                alertNotif.setType(com.digitallanka.backend.model.Notification.Type.STOLEN_ALERT);
                alertNotif.setRead(false);
                notificationRepository.save(alertNotif);

                return ResponseEntity.ok(new ComplianceResponse(
                        vehicle.getPlateNumber(),
                        "ACTIVE",
                        "Unauthorized Driver (Authorization Expired)",
                        vehicle.getOwnerNic(),
                        false
                ));
            }
        }

        // 7. Fully authorized
        return ResponseEntity.ok(new ComplianceResponse(
                vehicle.getPlateNumber(),
                "ACTIVE",
                "AUTHORIZED (Driver)",
                vehicle.getOwnerNic(),
                true
        ));
    }

    // ── Inner DTO classes ─────────────────────────────────────────────────────

    @lombok.Data
    public static class RecoveryRequest {
        private String remarks;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ComplianceResponse {
        private String plateNumber;
        private String vehicleStatus;
        private String authorizationStatus;
        private String ownerNic;
        private boolean allowedToDrive;
    }
}
