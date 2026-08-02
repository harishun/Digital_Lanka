package com.digitallanka.backend.service;

import com.digitallanka.backend.model.Asset;
import com.digitallanka.backend.model.VehicleAsset;
import com.digitallanka.backend.repository.VehicleAssetRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AssetVerificationService {

    private final VehicleAssetRepository vehicleAssetRepository;

    public AssetVerificationService(VehicleAssetRepository vehicleAssetRepository) {
        this.vehicleAssetRepository = vehicleAssetRepository;
    }

    /**
     * Registers a new vehicle asset. 
     * Core Logic: Rejects processing if Chassis or Plate match an active record.
     */
    public VehicleAsset registerVehicleAsset(VehicleAsset asset) {
        if (vehicleAssetRepository.existsByPlateNumberOrChassisNumber(asset.getPlateNumber(), asset.getChassisNumber())) {
            throw new IllegalArgumentException("Registration rejected: A vehicle with this Plate Number or Chassis Number is already active or pending.");
        }
        
        asset.setStatus(Asset.AssetStatus.PENDING_VERIFICATION);
        return vehicleAssetRepository.save(asset);
    }

}
