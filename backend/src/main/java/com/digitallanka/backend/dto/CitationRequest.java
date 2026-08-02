package com.digitallanka.backend.dto;

import lombok.Data;

@Data
public class CitationRequest {
    private String violationType;
    private String gpsCoordinates;
}
