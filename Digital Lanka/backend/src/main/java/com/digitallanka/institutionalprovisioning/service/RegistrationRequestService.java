package com.digitallanka.institutionalprovisioning.service;

import com.digitallanka.institutionalprovisioning.dto.CreateRegistrationRequestDto;
import com.digitallanka.institutionalprovisioning.dto.RegistrationRequestResponseDto;

import java.util.List;

public interface RegistrationRequestService {
    RegistrationRequestResponseDto createRequest(CreateRegistrationRequestDto request);
    List<RegistrationRequestResponseDto> getAllRequests();
    RegistrationRequestResponseDto approveRequest(Long id);
    RegistrationRequestResponseDto rejectRequest(Long id);
}
