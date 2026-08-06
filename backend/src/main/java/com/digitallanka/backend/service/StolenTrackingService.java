package com.digitallanka.backend.service;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import com.digitallanka.backend.model.TheftCase;
import com.digitallanka.backend.entity.User;
import com.digitallanka.backend.repository.TheftCaseRepository;
import com.digitallanka.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class StolenTrackingService {

    /**
     * States in which a vehicle is still flagged to law enforcement. A retrieval
     * claim from the owner does NOT clear the flag — only an officer can.
     */
    private static final java.util.List<TheftCase.Status> OPEN_STATUSES =
            java.util.List.of(TheftCase.Status.PENDING, TheftCase.Status.RETRIEVAL_REPORTED);

    @Autowired
    private TheftCaseRepository theftCaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GovApiClient govApiClient;

    /**
     * Reports a vehicle as stolen. Verifies ownership via the DMT API.
     * Creates a TheftCase record — vehicle status is derived from TheftCase,
     * not stored in a local vehicles table.
     */
    @Transactional
    public TheftCase reportStolen(String ownerNic, String vehicleId) {
        // 1. Verify vehicle exists in DMT government database
        VehicleRegistrationResponse vehicle = govApiClient.getVehicleByPlate(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found in government records."));

        // 2. Verify only the owner can report stolen
        if (!vehicle.getOwnerNic().equals(ownerNic)) {
            throw new IllegalStateException("Only the registered owner can report a vehicle as stolen.");
        }

        // 3. Prevent duplicate theft reports (a case awaiting verification counts)
        boolean alreadyStolen = theftCaseRepository
                .findByVehicleIdAndStatusIn(vehicleId, OPEN_STATUSES)
                .isPresent();
        if (alreadyStolen) {
            throw new IllegalStateException("Vehicle is already marked as stolen.");
        }

        // 4. Create theft case record
        TheftCase theft = new TheftCase();
        theft.setId(UUID.randomUUID().toString());
        theft.setVehicleId(vehicleId);
        theft.setReporterNic(ownerNic);
        theft.setReportedAt(LocalDateTime.now());
        theft.setStatus(TheftCase.Status.PENDING);

        return theftCaseRepository.save(theft);
    }

    /**
     * Marks a stolen vehicle as recovered. Only verified law enforcement can do this.
     * Resolves the pending TheftCase.
     */
    @Transactional
    public TheftCase markRecovered(String officerNic, String vehicleId, String remarks) {
        // 1. Verify resolver is a verified Law Enforcement Officer
        User officer = userRepository.findById(officerNic)
                .orElseThrow(() -> new IllegalArgumentException("Officer not found in system."));
        if (officer.getRole() == null || !officer.getRole().isLawEnforcement()) {
            throw new IllegalStateException(
                    "Only verified law enforcement officers can mark a stolen vehicle as recovered.");
        }

        // 2. Verify vehicle exists in DMT government database
        govApiClient.getVehicleByPlate(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found in government records."));

        // 3. Find the open theft case — either still missing, or the owner has
        //    reported retrieval and is waiting on this verification.
        TheftCase theft = theftCaseRepository.findByVehicleIdAndStatusIn(vehicleId, OPEN_STATUSES)
                .orElseThrow(() -> new IllegalStateException("No open theft case found for this vehicle."));

        // 4. Resolve the theft case
        theft.setStatus(TheftCase.Status.RESOLVED);
        theft.setResolvedAt(LocalDateTime.now());
        theft.setResolvingOfficerNic(officerNic);
        theft.setRemarks(remarks);

        return theftCaseRepository.save(theft);
    }

    /**
     * Lets the registered owner close their own theft report when they get the
     * vehicle back without police involvement (found it, recovered privately,
     * reported in error).
     *
     * <p>This does NOT clear the vehicle. It moves the case to
     * {@code RETRIEVAL_REPORTED}, where the vehicle stays flagged to law
     * enforcement until an officer verifies it via {@link #markRecovered}.
     */
    @Transactional
    public TheftCase reportRetrievedByOwner(String ownerNic, String vehicleId, String remarks) {
        // 1. Verify vehicle exists in DMT government database
        VehicleRegistrationResponse vehicle = govApiClient.getVehicleByPlate(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found in government records."));

        // 2. Only the registered owner may close their own theft report
        if (!vehicle.getOwnerNic().equals(ownerNic)) {
            throw new IllegalStateException("Only the registered owner can report a vehicle as retrieved.");
        }

        // 3. There must be an active theft report to respond to
        TheftCase theft = theftCaseRepository.findByVehicleIdAndStatus(vehicleId, TheftCase.Status.PENDING)
                .orElseThrow(() -> new IllegalStateException(
                        "This vehicle is not currently reported stolen, or retrieval has already been reported."));

        theft.setStatus(TheftCase.Status.RETRIEVAL_REPORTED);
        theft.setRetrievalReportedAt(LocalDateTime.now());
        theft.setRemarks(remarks != null && !remarks.isBlank()
                ? "Retrieval reported by owner: " + remarks
                : "Retrieval reported by owner. Awaiting police verification.");

        return theftCaseRepository.save(theft);
    }

    /**
     * Checks whether a vehicle currently has an active (PENDING) theft report.
     */
    public boolean isStolenVehicle(String vehicleId) {
        return theftCaseRepository.findByVehicleIdAndStatusIn(vehicleId, OPEN_STATUSES).isPresent();
    }

    /** The current open theft case for a vehicle, if any. */
    public java.util.Optional<TheftCase> findOpenCase(String vehicleId) {
        return theftCaseRepository.findByVehicleIdAndStatusIn(vehicleId, OPEN_STATUSES);
    }

    /** Retrieval claims waiting on an officer to verify. */
    public java.util.List<TheftCase> findAwaitingVerification() {
        return theftCaseRepository.findByStatusOrderByRetrievalReportedAtDesc(
                TheftCase.Status.RETRIEVAL_REPORTED);
    }
}
