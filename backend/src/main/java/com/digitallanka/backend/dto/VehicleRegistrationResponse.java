package com.digitallanka.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * DTO representing a vehicle registration record from the DMT Mock API
 * (vehicle_registrations table in dmt_mock_db).
 *
 * The 'id' field is set to the plate number by the DMT API so that the
 * application can use plate numbers as the canonical vehicle identifier.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VehicleRegistrationResponse {

    /** Canonical vehicle identifier — equals the plate number (e.g. "WP LA-9999"). */
    private String id;

    private String plateNumber;
    private String customName;
    private String make;
    private String model;
    private String color;
    private Integer makeYear;
    private String vehicleClass;
    private String ownerNic;
    private String chassisNo;
    private String engineNo;
    private String fuelType;
    private String docNo;
    private String issueDate;
    private String expiryDate;
    private String authority;

    /**
     * Runtime-computed status derived from TheftCase records in the application DB.
     * Not returned by the DMT API — populated by the backend before sending to UI.
     */
    private String status = "ACTIVE";
}
