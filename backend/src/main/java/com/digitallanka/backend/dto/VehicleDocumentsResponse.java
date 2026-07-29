package com.digitallanka.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class VehicleDocumentsResponse {
    @JsonProperty("vehicle_id")
    private String vehicleId;
    
    private VrcDoc vrc;
    private RevenueDoc revenue;
    private InsuranceDoc insurance;
    private EmissionDoc emission;

    @Data
    public static class VrcDoc {
        private String docNo;
        private String plateNumber;
        private String issueDate;
        private String expiryDate;
        private String authority;
        private String chassisNo;
        private String engineNo;
        private String fuelType;
    }

    @Data
    public static class RevenueDoc {
        private String licenseNo;
        private String issueDate;
        private String expiryDate;
        private String authority;
        private String status;
        private String fee;
    }

    @Data
    public static class InsuranceDoc {
        private String policyNo;
        private String underwriter;
        private String policyType;
        private String issueDate;
        private String expiryDate;
        private String premium;
    }

    @Data
    public static class EmissionDoc {
        private String testNo;
        private String testingCenter;
        private String result;
        private String issueDate;
        private String expiryDate;
        private String coValue;
        private String hcValue;
    }
}
