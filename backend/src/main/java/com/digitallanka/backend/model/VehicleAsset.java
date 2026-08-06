package com.digitallanka.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicle_assets")
public class VehicleAsset extends Asset {

    @Column(name = "custom_name", nullable = false)
    private String customName;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    @Column(name = "chassis_number", nullable = false, unique = true)
    private String chassisNumber;

    @Column(name = "plate_number", nullable = false, unique = true)
    private String plateNumber;

    private String color;
}
