package com.digitallanka.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CitizenResponse {
    private String id;
    private String nic;
    
    @JsonProperty("ic_number")
    private String icNumber;
    
    @JsonProperty("full_name")
    private String fullName;
    
    @JsonProperty("name_on_card")
    private String nameOnCard;
    
    private String gender;
    
    @JsonProperty("date_of_birth")
    private String dateOfBirth; // ISO format (YYYY-MM-DD)
    
    @JsonProperty("photo_url")
    private String photoUrl;
    
    @JsonProperty("signature_url")
    private String signatureUrl;
}
