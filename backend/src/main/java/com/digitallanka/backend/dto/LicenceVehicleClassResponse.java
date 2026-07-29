package com.digitallanka.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LicenceVehicleClassResponse {
    private String id;
    
    @JsonProperty("class_code")
    private String classCode;
    
    private String description;
    private String category;
    
    @JsonProperty("issued_date")
    private String issuedDate; // YYYY-MM-DD
    
    @JsonProperty("expiry_date")
    private String expiryDate; // YYYY-MM-DD
}
