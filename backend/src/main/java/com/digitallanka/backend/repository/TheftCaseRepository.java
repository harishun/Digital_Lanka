package com.digitallanka.backend.repository;

import com.digitallanka.backend.model.TheftCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TheftCaseRepository extends JpaRepository<TheftCase, String> {
    Optional<TheftCase> findByVehicleIdAndStatus(String vehicleId, TheftCase.Status status);

    /** Any case that is not yet RESOLVED — i.e. the vehicle is still flagged. */
    Optional<TheftCase> findByVehicleIdAndStatusIn(String vehicleId, java.util.Collection<TheftCase.Status> statuses);

    /** Cases awaiting an officer's verification, newest first. */
    java.util.List<TheftCase> findByStatusOrderByRetrievalReportedAtDesc(TheftCase.Status status);
}
