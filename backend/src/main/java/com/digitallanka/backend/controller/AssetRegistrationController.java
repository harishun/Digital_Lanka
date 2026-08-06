package com.digitallanka.backend.controller;

import com.digitallanka.backend.model.VehicleAsset;
import com.digitallanka.backend.service.AssetVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetRegistrationController {

    private final AssetVerificationService assetVerificationService;

    public AssetRegistrationController(AssetVerificationService assetVerificationService) {
        this.assetVerificationService = assetVerificationService;
    }

    @PostMapping("/register-vehicle")
    public ResponseEntity<?> registerVehicle(@RequestBody VehicleAsset vehicleAsset) {
        try {
            String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
            vehicleAsset.setOwnerNic(ownerNic);

            VehicleAsset registeredAsset = assetVerificationService.registerVehicleAsset(vehicleAsset);
            return ResponseEntity.ok(registeredAsset);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-vehicles")
    public ResponseEntity<?> getMyVehicleAssets() {
        String ownerNic = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assetVerificationService.getVehicleAssetsByOwner(ownerNic));
    }
}
