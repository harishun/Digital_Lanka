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

    /**
     * Verifies if a vehicle is registered based on plate number and owner NIC.
     */
    public boolean verifyPublicRegistration(String plateNumber, String ownerNic) {
        Optional<VehicleAsset> vehicleAssetOpt = vehicleAssetRepository.findByPlateNumber(plateNumber);
        
        if (vehicleAssetOpt.isPresent()) {
            VehicleAsset asset = vehicleAssetOpt.get();
            // Using OOP getter
            return asset.getOwnerNic().equals(ownerNic) && asset.getStatus() == Asset.AssetStatus.ACTIVE;
        }
        
        return false;
    }
}
