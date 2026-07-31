package com.digitallanka.institutionalprovisioning.service.impl;

import com.digitallanka.institutionalprovisioning.dto.CreateUserRequestDto;
import com.digitallanka.institutionalprovisioning.dto.UpdateUserRequestDto;
import com.digitallanka.institutionalprovisioning.dto.UserResponseDto;
import com.digitallanka.institutionalprovisioning.entity.Role;
import com.digitallanka.institutionalprovisioning.entity.User;
import com.digitallanka.institutionalprovisioning.exception.DuplicateUserException;
import com.digitallanka.institutionalprovisioning.exception.UserNotFoundException;
import com.digitallanka.institutionalprovisioning.repository.UserRepository;
import com.digitallanka.institutionalprovisioning.dto.CitizenDto;
import com.digitallanka.institutionalprovisioning.service.DrpService;
import com.digitallanka.institutionalprovisioning.service.UserManagementService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DrpService drpService;

    public UserManagementServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, DrpService drpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.drpService = drpService;
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto createUser(CreateUserRequestDto request) {
        if (userRepository.existsByNic(request.getNic())) {
            throw new DuplicateUserException("User with NIC '" + request.getNic() + "' already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateUserException("User with Email '" + request.getEmail() + "' already exists");
        }

        // Sync/Register in DRP Mock Database
        try {
            CitizenDto citizen = drpService.getCitizenByNic(request.getNic());
            if (citizen == null) {
                // Citizen doesn't exist, create a new record in DRP Mock Database
                citizen = new CitizenDto();
                citizen.setNic(request.getNic());
                citizen.setFullName(request.getFullName());
                citizen.setGender("MALE"); // Default required field
                citizen.setDateOfBirth("1990-01-01"); // Default required field
                citizen.setPlaceOfBirth("Colombo");
                citizen.setDistrictOfBirth("Colombo");
                citizen.setAddressCity("Colombo");
                drpService.createCitizen(citizen);
            } else {
                // If citizen exists, ensure full name matches the official registry
                request.setFullName(citizen.getFullName());
            }
        } catch (Exception e) {
            System.err.println("Warning: DRP citizen registry sync failed in admin flow: " + e.getMessage());
        }

        User user = new User();
        user.setNic(request.getNic());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        // Conditional assignment based on roles to maintain clean state
        if (request.getRole() == Role.ADMIN) {
            user.setDepartment(request.getDepartment());
            user.setBatchNumber(null);
            user.setRank(null);
            user.setPoliceStation(null);
        } else if (request.getRole() == Role.OFFICER) {
            user.setDepartment(null);
            user.setBatchNumber(request.getBatchNumber());
            user.setRank(request.getRank());
            user.setPoliceStation(request.getPoliceStation());
        } else {
            user.setDepartment(null);
            user.setBatchNumber(null);
            user.setRank(null);
            user.setPoliceStation(null);
        }

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Override
    public UserResponseDto updateUser(Long id, UpdateUserRequestDto request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        userRepository.findByNic(request.getNic()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(id)) {
                throw new DuplicateUserException("User with NIC '" + request.getNic() + "' already exists");
            }
        });

        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(id)) {
                throw new DuplicateUserException("User with Email '" + request.getEmail() + "' already exists");
            }
        });

        user.setNic(request.getNic());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user.setRole(request.getRole());

        // Conditional assignment based on roles to maintain clean state
        if (request.getRole() == Role.ADMIN) {
            user.setDepartment(request.getDepartment());
            user.setBatchNumber(null);
            user.setRank(null);
            user.setPoliceStation(null);
        } else if (request.getRole() == Role.OFFICER) {
            user.setDepartment(null);
            user.setBatchNumber(request.getBatchNumber());
            user.setRank(request.getRank());
            user.setPoliceStation(request.getPoliceStation());
        } else {
            user.setDepartment(null);
            user.setBatchNumber(null);
            user.setRank(null);
            user.setPoliceStation(null);
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    @Override
    public UserResponseDto updateUserRole(Long id, com.digitallanka.institutionalprovisioning.dto.AssignRoleRequestDto request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        Role role = request.getRole();
        user.setRole(role);

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Clean up or set role-specific fields if switching roles
        if (role == Role.ADMIN) {
            user.setDepartment(request.getDepartment());
            user.setBatchNumber(null);
            user.setRank(null);
            user.setPoliceStation(null);
        } else if (role == Role.OFFICER) {
            user.setDepartment(null);
            user.setBatchNumber(request.getBatchNumber());
            user.setRank(request.getRank());
            user.setPoliceStation(request.getPoliceStation());
        } else {
            user.setDepartment(null);
            user.setBatchNumber(null);
            user.setRank(null);
            user.setPoliceStation(null);
        }

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void syncCitizensFromDrp() {
        int page = 1;
        int limit = 50;
        boolean hasMore = true;
        
        while (hasMore) {
            java.util.List<com.digitallanka.institutionalprovisioning.dto.CitizenDto> citizens = drpService.getAllCitizens(page, limit);
            if (citizens == null || citizens.isEmpty()) {
                hasMore = false;
                break;
            }
            
            for (com.digitallanka.institutionalprovisioning.dto.CitizenDto citizen : citizens) {
                if (citizen.getNic() == null || citizen.getNic().trim().isEmpty()) {
                    continue;
                }
                
                if (!userRepository.existsByNic(citizen.getNic())) {
                    User user = new User();
                    user.setNic(citizen.getNic());
                    user.setFullName(citizen.getFullName());
                    user.setRole(Role.CITIZEN);
                    user.setPassword(null);
                    userRepository.save(user);
                }
            }
            
            if (citizens.size() < limit) {
                hasMore = false;
            } else {
                page++;
            }
        }
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        // Prevent deletion of system super-admins if necessary, but we will allow it if they request CRUD.
        userRepository.delete(user);
    }

    private UserResponseDto convertToDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getNic(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getBatchNumber(),
                user.getRank(),
                user.getPoliceStation(),
                user.getCreatedAt()
        );
    }
}
