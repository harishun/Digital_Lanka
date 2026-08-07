package com.digitallanka.backend.dto;

import lombok.Data;

@Data
public class CitationRequest {
    private String driverNic;
    private String plateNumber;
    private String violationType;
    private String gpsCoordinates;
    private String fineAmount;
}
