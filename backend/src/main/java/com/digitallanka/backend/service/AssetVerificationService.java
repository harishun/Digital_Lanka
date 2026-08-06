package com.digitallanka.backend.service;

import com.digitallanka.backend.model.Asset;
import com.digitallanka.backend.model.VehicleAsset;
import com.digitallanka.backend.repository.VehicleAssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssetVerificationService {

    private final VehicleAssetRepository vehicleAssetRepository;

    public AssetVerificationService(VehicleAssetRepository vehicleAssetRepository) {
        this.vehicleAssetRepository = vehicleAssetRepository;
    }

    @Transactional
    public VehicleAsset registerVehicleAsset(VehicleAsset vehicleAsset) {
        if (vehicleAssetRepository.findByPlateNumber(vehicleAsset.getPlateNumber()).isPresent()) {
            throw new IllegalArgumentException("A vehicle with plate number " + vehicleAsset.getPlateNumber() + " is already registered.");
        }
        if (vehicleAssetRepository.findByChassisNumber(vehicleAsset.getChassisNumber()).isPresent()) {
            throw new IllegalArgumentException("A vehicle with chassis number " + vehicleAsset.getChassisNumber() + " is already registered.");
        }

        vehicleAsset.setStatus(Asset.AssetStatus.PENDING_VERIFICATION);
        return vehicleAssetRepository.save(vehicleAsset);
    }

    public List<VehicleAsset> getVehicleAssetsByOwner(String ownerNic) {
        return vehicleAssetRepository.findByOwnerNic(ownerNic);
    }
}
