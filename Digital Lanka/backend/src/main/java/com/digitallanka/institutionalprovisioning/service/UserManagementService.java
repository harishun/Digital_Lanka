package com.digitallanka.institutionalprovisioning.service;

import com.digitallanka.institutionalprovisioning.dto.CreateUserRequestDto;
import com.digitallanka.institutionalprovisioning.dto.UpdateUserRequestDto;
import com.digitallanka.institutionalprovisioning.dto.UserResponseDto;
import com.digitallanka.institutionalprovisioning.entity.Role;

import java.util.List;

public interface UserManagementService {
    List<UserResponseDto> getAllUsers();
    UserResponseDto createUser(CreateUserRequestDto request);
    UserResponseDto updateUser(Long id, UpdateUserRequestDto request);
    UserResponseDto updateUserRole(Long id, com.digitallanka.institutionalprovisioning.dto.AssignRoleRequestDto request);
    void syncCitizensFromDrp();
    void deleteUser(Long id);
}
