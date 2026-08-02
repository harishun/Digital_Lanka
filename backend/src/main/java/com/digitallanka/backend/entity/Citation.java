package com.digitallanka.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Citation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offender_nic", referencedColumnName = "nic")
    private User offender;

    @Column(name = "violation_type", nullable = false)
    private String violationType;

    @Column(name = "gps_coordinates")
    private String gpsCoordinates;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CitationStatus status;
}
