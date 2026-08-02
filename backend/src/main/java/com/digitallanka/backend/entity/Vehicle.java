package com.digitallanka.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String plateNo;

    @Column(name = "plate_number")
    private String plateNumber;

    @Builder.Default
    @Column(name = "model")
    private String model = "Toyota Prius (Grey)";

    @Builder.Default
    @Column(name = "vehicle_class")
    private String vehicleClass = "B";

    @Builder.Default
    @Column(name = "fuel_type")
    private String fuelType = "Petrol / Hybrid";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_nic", referencedColumnName = "nic")
    private User owner;

    @Builder.Default
    @Column(name = "insurance_status")
    private String insuranceStatus = "VALID";

    @Builder.Default
    @Column(name = "revenue_status")
    private String revenueStatus = "VALID";

    @Builder.Default
    @Column(name = "status")
    private String status = "ACTIVE";
}
