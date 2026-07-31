package com.digitallanka.institutionalprovisioning.dto;

public class LoginResponseDto {
    private String token;
    private Long id;
    private String nic;
    private String fullName;
    private String role;

    public LoginResponseDto() {
    }

    public LoginResponseDto(String token, Long id, String nic, String fullName, String role) {
        this.token = token;
        this.id = id;
        this.nic = nic;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
