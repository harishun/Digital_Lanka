package com.digitallanka.institutionalprovisioning.service;

import com.digitallanka.institutionalprovisioning.dto.LoginRequestDto;
import com.digitallanka.institutionalprovisioning.dto.LoginResponseDto;

public interface AuthService {
    LoginResponseDto login(LoginRequestDto loginRequest);
}
