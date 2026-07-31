package com.digitallanka.institutionalprovisioning.controller;

import com.digitallanka.institutionalprovisioning.dto.AssignRoleRequestDto;
import com.digitallanka.institutionalprovisioning.dto.CreateUserRequestDto;
import com.digitallanka.institutionalprovisioning.dto.UpdateUserRequestDto;
import com.digitallanka.institutionalprovisioning.dto.UserResponseDto;
import com.digitallanka.institutionalprovisioning.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> syncCitizens() {
        userManagementService.syncCitizensFromDrp();
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto request) {
        UserResponseDto createdUser = userManagementService.createUser(request);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDto request
    ) {
        UserResponseDto updatedUser = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequestDto request
    ) {
        UserResponseDto updatedUser = userManagementService.updateUserRole(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
