package com.digitallanka.backend.repository;

import com.digitallanka.backend.model.VehicleAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleAssetRepository extends JpaRepository<VehicleAsset, Long> {
    List<VehicleAsset> findByOwnerNic(String ownerNic);
    Optional<VehicleAsset> findByPlateNumber(String plateNumber);
    Optional<VehicleAsset> findByChassisNumber(String chassisNumber);
}
