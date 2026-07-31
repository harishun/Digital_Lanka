package com.digitallanka.institutionalprovisioning.repository;

import com.digitallanka.institutionalprovisioning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNic(String nic);
    boolean existsByEmail(String email);
    boolean existsByNic(String nic);
    java.util.List<User> findAllByOrderByCreatedAtDesc();
}
