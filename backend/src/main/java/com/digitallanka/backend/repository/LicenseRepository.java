package com.digitallanka.backend.repository;

import com.digitallanka.backend.entity.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<License, String> {
    Optional<License> findByDlNo(String dlNo);
    Optional<License> findByDriverNic(String nic);
}
