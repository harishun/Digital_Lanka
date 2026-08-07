package com.digitallanka.backend.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 12)
    private String nic; // Use NIC directly as PK for simpler joins in core app

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        ROLE_CITIZEN,
        ROLE_OFFICER,
        ROLE_ADMIN,
        ROLE_SUPER_ADMIN
    }
}
