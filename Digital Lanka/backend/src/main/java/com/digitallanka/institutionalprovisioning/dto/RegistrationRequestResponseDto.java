package com.digitallanka.institutionalprovisioning.dto;

import com.digitallanka.institutionalprovisioning.entity.Role;
import java.time.LocalDateTime;

public class RegistrationRequestResponseDto {

    private Long id;
    private String nic;
    private String fullName;
    private String email;
    private Role role;
    private String department;
    private String batchNumber;
    private String rank;
    private String policeStation;
    private String status;
    private LocalDateTime createdAt;

    public RegistrationRequestResponseDto() {
    }

    public RegistrationRequestResponseDto(Long id, String nic, String fullName, String email, Role role,
                                         String department, String batchNumber, String rank, String policeStation,
                                         String status, LocalDateTime createdAt) {
        this.id = id;
        this.nic = nic;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.department = department;
        this.batchNumber = batchNumber;
        this.rank = rank;
        this.policeStation = policeStation;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
