package com.digitallanka.institutionalprovisioning.controller;

import com.digitallanka.institutionalprovisioning.dto.LoginRequestDto;
import com.digitallanka.institutionalprovisioning.dto.LoginResponseDto;
import com.digitallanka.institutionalprovisioning.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        LoginResponseDto response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
