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

    @Autowired
    private com.digitallanka.backend.repository.VehicleAssetRepository vehicleAssetRepository;

    /**
     * GET /api/vehicles/my-vehicles
     * Returns all vehicles owned by the currently authenticated user,
     * fetched from the VehicleAsset database, enriched with stolen status.
     */
    @GetMapping("/my-vehicles")
    public ResponseEntity<List<VehicleRegistrationResponse>> getMyVehicles() {
        String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG: getMyVehicles called for NIC: " + ownerNic);
        
        List<com.digitallanka.backend.model.VehicleAsset> assets = vehicleAssetRepository.findByOwnerNic(ownerNic);
        
        if (assets.isEmpty()) {
            System.out.println("DEBUG: No vehicles found for " + ownerNic + ". Auto-generating a default vehicle.");
            com.digitallanka.backend.model.VehicleAsset defaultVehicle = new com.digitallanka.backend.model.VehicleAsset();
            defaultVehicle.setOwnerNic(ownerNic);
            defaultVehicle.setCustomName("Demo Vehicle (" + ownerNic + ")");
            defaultVehicle.setMake("Toyota");
            defaultVehicle.setModel("Aqua");
            defaultVehicle.setChassisNumber("CHA-DEMO-" + System.currentTimeMillis());
            defaultVehicle.setPlateNumber("WP DEMO-" + (1000 + new java.util.Random().nextInt(9000)));
            defaultVehicle.setColor("White");
            defaultVehicle.setStatus(com.digitallanka.backend.model.Asset.AssetStatus.ACTIVE);
            
            vehicleAssetRepository.save(defaultVehicle);
            assets.add(defaultVehicle);
        }
        
        System.out.println("DEBUG: Found " + assets.size() + " vehicles for " + ownerNic);
        List<VehicleRegistrationResponse> vehicles = new java.util.ArrayList<>();
        
        for (com.digitallanka.backend.model.VehicleAsset asset : assets) {
            VehicleRegistrationResponse response = new VehicleRegistrationResponse();
            response.setId(asset.getPlateNumber());
            response.setPlateNumber(asset.getPlateNumber());
            response.setOwnerNic(asset.getOwnerNic());
            response.setChassisNo(asset.getChassisNumber());
            response.setCustomName(asset.getCustomName());
            response.setMake(asset.getMake());
            response.setModel(asset.getModel());
            response.setColor(asset.getColor());
            
            boolean isStolen = theftCaseRepository
                    .findByVehicleIdAndStatus(asset.getPlateNumber(), TheftCase.Status.PENDING)
                    .isPresent();
            response.setStatus(isStolen ? "STOLEN" : "ACTIVE");
            vehicles.add(response);
        }
        
        System.out.println("DEBUG: Returning vehicles: " + vehicles);
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
