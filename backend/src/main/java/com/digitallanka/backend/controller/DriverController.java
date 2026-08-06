package com.digitallanka.backend.controller;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import com.digitallanka.backend.model.VehicleAuthorization;
import com.digitallanka.backend.repository.VehicleAuthorizationRepository;
import com.digitallanka.backend.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private GovApiClient govApiClient;

    @Autowired
    private VehicleAuthorizationRepository authorizationRepository;

    /**
     * GET /api/drivers/invitations
     * Returns all PENDING authorization invitations for the current driver.
     * Enriches each invitation with live vehicle data from the DMT API.
     */
    @GetMapping("/invitations")
    public ResponseEntity<List<AuthorizedVehicleDto>> getPendingInvitations() {
        String driverNic = SecurityContextHolder.getContext().getAuthentication().getName();
        List<VehicleAuthorization> list = authorizationRepository.findByAuthorizedNicAndStatus(
                driverNic, VehicleAuthorization.Status.PENDING);

        List<AuthorizedVehicleDto> dtos = list.stream()
                .map(auth -> buildDto(auth, driverNic))
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/drivers/authorized-vehicles
     * Returns all vehicles for which the current driver has GRANTED access.
     * Enriches each with live vehicle data from the DMT API.
     */
    @GetMapping("/authorized-vehicles")
    public ResponseEntity<List<AuthorizedVehicleDto>> getAuthorizedVehicles() {
        String driverNic = SecurityContextHolder.getContext().getAuthentication().getName();
        authorizationService.syncOwnVehicleAuthorizations(driverNic);

        List<VehicleAuthorization> auths = authorizationRepository.findByAuthorizedNicAndStatus(
                driverNic, VehicleAuthorization.Status.GRANTED);

        List<AuthorizedVehicleDto> list = auths.stream()
                .map(auth -> buildDto(auth, driverNic))
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(list);
    }

    /**
     * POST /api/drivers/invitations/{authId}/respond
     * Accepts or declines a pending driving invitation.
     */
    @PostMapping("/invitations/{authId}/respond")
    public ResponseEntity<?> respondToInvitation(
            @PathVariable("authId") String authId,
            @RequestBody RespondRequest request) {

        String driverNic = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            VehicleAuthorization auth = authorizationService.respondToInvitation(
                    driverNic, authId, request.isAccept());
            return ResponseEntity.ok(auth);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse(e.getMessage()));
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private AuthorizedVehicleDto buildDto(VehicleAuthorization auth, String driverNic) {
        VehicleRegistrationResponse v = govApiClient.getVehicleByPlate(auth.getVehicleId()).orElse(null);
        if (v == null) return null;

        AuthorizedVehicleDto dto = new AuthorizedVehicleDto();
        dto.setId(v.getPlateNumber());
        dto.setPlateNumber(v.getPlateNumber());
        dto.setModel(v.getModel());
        dto.setChassisNumber(v.getChassisNo());
        dto.setOwnerNic(v.getOwnerNic());
        dto.setStatus("ACTIVE");
        dto.setVehicleClass(v.getVehicleClass());
        dto.setAuthId(auth.getId());
        dto.setAccessType(auth.getAccessType());
        return dto;
    }

    // ── Inner DTO classes ─────────────────────────────────────────────────────

    @lombok.Data
    public static class AuthorizedVehicleDto {
        private String id;
        private String plateNumber;
        private String model;
        private String chassisNumber;
        private String ownerNic;
        private String status;
        private String vehicleClass;
        private String authId;
        private VehicleAuthorization.AccessType accessType;
    }

    @lombok.Data
    public static class RespondRequest {
        private boolean accept;
    }
}
