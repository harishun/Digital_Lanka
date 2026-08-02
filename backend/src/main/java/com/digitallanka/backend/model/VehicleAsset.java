package com.digitallanka.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * VehicleAsset entity extending Asset.
 * Represents a locally registered vehicle in the Digital Lanka system.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vehicle_assets")
public class VehicleAsset extends Asset {

    @Column(nullable = false)
    private String customName;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false, unique = true)
    private String chassisNumber;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    // MVP Architecture: Storing relative URLs or paths as strings
    @Column(name = "vrc_path")
    private String vrcPath;

    @Column(name = "insurance_path")
    private String insurancePath;

    @Column(name = "revenue_license_path")
    private String revenueLicensePath;

    @Column(name = "emissions_path")
    private String emissionsPath;
}
