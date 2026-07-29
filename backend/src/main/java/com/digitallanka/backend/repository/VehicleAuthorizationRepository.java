package com.digitallanka.backend.repository;

import com.digitallanka.backend.model.VehicleAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleAuthorizationRepository extends JpaRepository<VehicleAuthorization, String> {
    long countByVehicleIdAndStatusIn(String vehicleId, Collection<VehicleAuthorization.Status> statuses);
    List<VehicleAuthorization> findByAuthorizedNicAndStatus(String authorizedNic, VehicleAuthorization.Status status);
    List<VehicleAuthorization> findByVehicleId(String vehicleId);
    Optional<VehicleAuthorization> findByVehicleIdAndAuthorizedNicAndStatus(
            String vehicleId, String authorizedNic, VehicleAuthorization.Status status);
}
