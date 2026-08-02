package com.digitallanka.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Base abstract class for all registrable assets.
 * Uses OOP Inheritance to share common asset properties.
 */
@Data
@MappedSuperclass
public abstract class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ownerNic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status = AssetStatus.PENDING_VERIFICATION;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AssetStatus {
        PENDING_VERIFICATION,
        ACTIVE,
        REJECTED
    }
}
