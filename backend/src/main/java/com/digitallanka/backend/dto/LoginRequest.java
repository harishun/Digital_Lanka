package com.digitallanka.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String nic;
    private String password;
}
