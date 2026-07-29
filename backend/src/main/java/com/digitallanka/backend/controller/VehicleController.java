package com.digitallanka.backend.controller;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import com.digitallanka.backend.model.TheftCase;
import com.digitallanka.backend.model.VehicleAuthorization;
import com.digitallanka.backend.repository.TheftCaseRepository;
import com.digitallanka.backend.repository.VehicleAuthorizationRepository;
import com.digitallanka.backend.service.AuthorizationService;
import com.digitallanka.backend.service.StolenTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private StolenTrackingService stolenTrackingService;

    @Autowired
    private GovApiClient govApiClient;

    @Autowired
    private VehicleAuthorizationRepository authorizationRepository;

    @Autowired
    private TheftCaseRepository theftCaseRepository;

    /**
     * GET /api/vehicles/my-vehicles
     * Returns all vehicles owned by the currently authenticated user,
     * fetched from the DMT government database, enriched with stolen status.
     */
    @GetMapping("/my-vehicles")
    public ResponseEntity<List<VehicleRegistrationResponse>> getMyVehicles() {
        String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        List<VehicleRegistrationResponse> vehicles = govApiClient.getVehiclesByOwnerNic(ownerNic);

        // Enrich each vehicle with its current stolen status from TheftCase table
        for (VehicleRegistrationResponse vehicle : vehicles) {
            boolean isStolen = theftCaseRepository
                    .findByVehicleIdAndStatus(vehicle.getPlateNumber(), TheftCase.Status.PENDING)
                    .isPresent();
            vehicle.setStatus(isStolen ? "STOLEN" : "ACTIVE");
        }

        return ResponseEntity.ok(vehicles);
    }

    /**
     * POST /api/vehicles/{id}/authorizations
     * Invites a driver to access a vehicle (creates a PENDING authorization).
     * {id} is the vehicle's plate number (e.g. "WP%20LA-9999").
     */
    @PostMapping("/{id}/authorizations")
    public ResponseEntity<?> inviteDriver(
            @PathVariable("id") String vehicleId,
            @RequestBody InvitationRequest request) {

        String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            VehicleAuthorization auth = authorizationService.createInvitation(
                    ownerNic,
                    vehicleId,
                    request.getTargetNic(),
                    request.getAccessType(),
                    request.getStartTime(),
                    request.getEndTime()
            );
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/vehicles/{id}/authorizations/{authId}
     * Revokes an active driver authorization.
     */
    @DeleteMapping("/{id}/authorizations/{authId}")
    public ResponseEntity<?> revokeDriverAccess(
            @PathVariable("id") String vehicleId,
            @PathVariable("authId") String authId) {

        String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            VehicleAuthorization auth = authorizationService.revokeAuthorization(ownerNic, authId);
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/vehicles/{id}/authorizations
     * Returns the full authorization history for a vehicle (all statuses).
     */
    @GetMapping("/{id}/authorizations")
    public ResponseEntity<List<VehicleAuthorization>> getAuthorizationsHistory(
            @PathVariable("id") String vehicleId) {
        List<VehicleAuthorization> list = authorizationRepository.findByVehicleId(vehicleId);
        return ResponseEntity.ok(list);
    }

    /**
     * POST /api/vehicles/{id}/stolen
     * Reports a vehicle as stolen. Creates a TheftCase record.
     */
    @PostMapping("/{id}/stolen")
    public ResponseEntity<?> reportStolen(@PathVariable("id") String vehicleId) {
        String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            TheftCase theft = stolenTrackingService.reportStolen(ownerNic, vehicleId);
            return ResponseEntity.ok(theft);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/vehicles/{id}/documents
     * Fetches all government documents for a vehicle from the DMT mock API.
     */
    @GetMapping("/{id}/documents")
    public ResponseEntity<?> getVehicleDocuments(@PathVariable("id") String vehicleId) {
        return govApiClient.getVehicleDocuments(vehicleId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Inner DTO classes ─────────────────────────────────────────────────────

    @lombok.Data
    public static class InvitationRequest {
        private String targetNic;
        private VehicleAuthorization.AccessType accessType;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime startTime;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime endTime;
    }

    @lombok.Data
    public static class ErrorResponse {
        private final String error;
        private final long timestamp = System.currentTimeMillis();
    }
}
