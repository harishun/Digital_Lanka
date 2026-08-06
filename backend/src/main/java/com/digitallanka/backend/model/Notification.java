package com.digitallanka.backend.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "recipient_nic", nullable = false, length = 12)
    private String recipientNic;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(name = "reference_id", length = 36)
    private String referenceId; // links to vehicle_authorizations.id or theft_cases.id

    @Column(name = "is_read", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        INVITATION,
        STOLEN_ALERT,
        CITATION,
        SEIZURE,
        RECOVERY,
        GENERAL
    }
}
