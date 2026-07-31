package com.digitallanka.institutionalprovisioning.dto;

import com.digitallanka.institutionalprovisioning.entity.Role;
import jakarta.validation.constraints.NotNull;

public class AssignRoleRequestDto {

    @NotNull(message = "Role is required")
    private Role role;

    private String password;
    private String department;
    private String batchNumber;
    private String rank;
    private String policeStation;

    // Getters and Setters
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    public String getPoliceStation() {
        return policeStation;
    }

    public void setPoliceStation(String policeStation) {
        this.policeStation = policeStation;
    }
}
