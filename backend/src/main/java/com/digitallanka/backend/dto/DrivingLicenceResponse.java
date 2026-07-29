package com.digitallanka.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class DrivingLicenceResponse {
    private String id;
    
    @JsonProperty("licence_number")
    private String licenceNumber;
    
    private String nic;
    private String surname;
    
    @JsonProperty("other_names")
    private String otherNames;
    
    @JsonProperty("full_name_on_card")
    private String fullNameOnCard;
    
    private String gender;
    
    @JsonProperty("date_of_birth")
    private String dateOfBirth; // YYYY-MM-DD
    
    @JsonProperty("blood_group")
    private String bloodGroup;
    
    @JsonProperty("height_ft")
    private Integer heightFt;
    
    @JsonProperty("height_inches")
    private Integer heightInches;
    
    @JsonProperty("permanent_address")
    private String permanentAddress;
    
    @JsonProperty("organ_donor")
    private boolean organDonor;
    
    @JsonProperty("driver_restrictions")
    private String driverRestrictions;
    
    @JsonProperty("photo_url")
    private String photoUrl;
    
    @JsonProperty("signature_url")
    private String signatureUrl;
    
    @JsonProperty("vehicle_classes")
    private List<LicenceVehicleClassResponse> vehicleClasses;
}
