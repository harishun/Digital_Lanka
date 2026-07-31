package com.digitallanka.institutionalprovisioning.repository;

import com.digitallanka.institutionalprovisioning.entity.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    boolean existsByEmailAndStatus(String email, String status);
    boolean existsByNicAndStatus(String nic, String status);
}
