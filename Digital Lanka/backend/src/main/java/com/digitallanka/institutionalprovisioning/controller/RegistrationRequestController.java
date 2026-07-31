package com.digitallanka.institutionalprovisioning.controller;

import com.digitallanka.institutionalprovisioning.dto.CreateRegistrationRequestDto;
import com.digitallanka.institutionalprovisioning.dto.RegistrationRequestResponseDto;
import com.digitallanka.institutionalprovisioning.service.RegistrationRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class RegistrationRequestController {

    private final RegistrationRequestService requestService;

    public RegistrationRequestController(RegistrationRequestService requestService) {
        this.requestService = requestService;
    }

    // Public Endpoint
    @PostMapping("/api/auth/register-request")
    public ResponseEntity<RegistrationRequestResponseDto> createRequest(
            @Valid @RequestBody CreateRegistrationRequestDto requestDto) {
        RegistrationRequestResponseDto response = requestService.createRequest(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Protected Endpoints (Admin/SuperAdmin)
    @GetMapping("/api/admin-requests")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<RegistrationRequestResponseDto>> getAllRequests() {
        List<RegistrationRequestResponseDto> requests = requestService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/api/admin-requests/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<RegistrationRequestResponseDto> approveRequest(@PathVariable Long id) {
        RegistrationRequestResponseDto response = requestService.approveRequest(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin-requests/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<RegistrationRequestResponseDto> rejectRequest(@PathVariable Long id) {
        RegistrationRequestResponseDto response = requestService.rejectRequest(id);
        return ResponseEntity.ok(response);
    }
}
