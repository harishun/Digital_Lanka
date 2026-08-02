package com.digitallanka.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class EnforcementDetailsResponse {
    private String driverNic;
    private String driverName;
    private String bloodGroup;
    private String dlNo;
    private String validOperators;
    private String plateNo;
    private String insuranceStatus;
    private String revenueStatus;
    private String status;
}
