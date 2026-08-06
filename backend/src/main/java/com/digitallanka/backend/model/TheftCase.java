package com.digitallanka.backend.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "theft_cases")
public class TheftCase {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "vehicle_id", nullable = false, length = 36)
    private String vehicleId;

    @Column(name = "reporter_nic", nullable = false, length = 12)
    private String reporterNic;

    @Column(name = "reported_at", nullable = false, updatable = false)
    private LocalDateTime reportedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolving_officer_nic", length = 12)
    private String resolvingOfficerNic;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "retrieval_reported_at")
    private LocalDateTime retrievalReportedAt;

    /**
     * Lifecycle of a theft report.
     *
     * <p>{@link #RETRIEVAL_REPORTED} is deliberately NOT the end state: the owner
     * saying they have the vehicle back is a claim, not a verification. The
     * vehicle stays flagged to law enforcement until an officer resolves it, so
     * a thief in possession of the owner's account cannot clear the flag.
     */
    public enum Status {
        /** Owner has reported the vehicle stolen. Flagged to law enforcement. */
        PENDING,
        /** Owner says it is back. Still flagged, awaiting police verification. */
        RETRIEVAL_REPORTED,
        /** An officer has verified recovery. Vehicle is clear. */
        RESOLVED
    }
}
