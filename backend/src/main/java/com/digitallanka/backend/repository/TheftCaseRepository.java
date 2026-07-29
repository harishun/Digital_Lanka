package com.digitallanka.backend.repository;

import com.digitallanka.backend.model.TheftCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TheftCaseRepository extends JpaRepository<TheftCase, String> {
    Optional<TheftCase> findByVehicleIdAndStatus(String vehicleId, TheftCase.Status status);
}
