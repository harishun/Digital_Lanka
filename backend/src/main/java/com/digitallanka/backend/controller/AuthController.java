package com.digitallanka.backend.controller;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.CitizenResponse;
import com.digitallanka.backend.dto.DrivingLicenceResponse;
import com.digitallanka.backend.model.User;
import com.digitallanka.backend.repository.UserRepository;
import com.digitallanka.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GovApiClient govApiClient;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        
        // 1. Axiom 1: Verify citizen registration exists in DRP mock database over REST
        CitizenResponse citizen = govApiClient.getCitizenByNic(request.getNic()).orElse(null);
        
        if (citizen == null) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("NIC not found in the Government DRP database."));
        }

        // 2. Axiom 3: Profile remains locked unless a valid driving licence is active in DMT
        boolean hasLicence = govApiClient.getDrivingLicenceByNic(request.getNic()).isPresent();
        
        if (!hasLicence) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("No valid driving license found in the DMT database."));
        }

        // 3. Prevent duplicate registration
        if (userRepository.findById(request.getNic()).isPresent()) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("An account is already registered for this NIC."));
        }

        // 4. Create User entity with hashed password
        User user = new User();
        user.setNic(request.getNic());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.ROLE_CITIZEN); // Default signup role
        user.setActive(true);
        userRepository.save(user);

        String fullName = citizen.getFullName() != null ? citizen.getFullName() : "Citizen (" + request.getNic() + ")";

        // 5. Generate and return JWT with custom claims (User Name, NIC, Role)
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getNic())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())))
                .build();
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", fullName);
        claims.put("nic", user.getNic());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(claims, userDetails);
        return ResponseEntity.ok(new AuthResponse(token, fullName, user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findById(request.getNic()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new VehicleController.ErrorResponse("User not registered. Please register first."));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VehicleController.ErrorResponse("Invalid password."));
        }

        CitizenResponse citizen = govApiClient.getCitizenByNic(user.getNic()).orElse(null);
        if (citizen == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new VehicleController.ErrorResponse("NIC not found in the Government DRP database."));
        }
        String fullName = citizen != null && citizen.getFullName() != null ? citizen.getFullName() : "Citizen (" + user.getNic() + ")";

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getNic())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())))
                .build();

        Map<String, Object> claims = new HashMap<>();
        claims.put("name", fullName);
        claims.put("nic", user.getNic());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(claims, userDetails);
        return ResponseEntity.ok(new AuthResponse(token, fullName, user.getRole().name()));
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<?> getMe(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        CitizenResponse citizen = govApiClient.getCitizenByNic(user.getNic()).orElse(null);
        DrivingLicenceResponse licence = govApiClient.getDrivingLicenceByNic(user.getNic()).orElse(null);

        Map<String, Object> profile = new HashMap<>();
        profile.put("nic", user.getNic());
        profile.put("fullName", citizen != null && citizen.getFullName() != null ? citizen.getFullName() : (licence != null && licence.getFullNameOnCard() != null ? licence.getFullNameOnCard() : "Citizen (" + user.getNic() + ")"));
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole().name().replace("ROLE_", ""));
        
        // Realistic fallback for test users not in Government DB
        profile.put("gender", citizen != null && citizen.getGender() != null ? citizen.getGender() : (licence != null && licence.getGender() != null ? licence.getGender() : "Male"));
        profile.put("dateOfBirth", citizen != null && citizen.getDateOfBirth() != null ? citizen.getDateOfBirth() : (licence != null && licence.getDateOfBirth() != null ? licence.getDateOfBirth() : "1988-04-12"));
        profile.put("address", licence != null && licence.getPermanentAddress() != null ? licence.getPermanentAddress() : "No. 100, Test Drive, Colombo");
        profile.put("dateOfIssue", "2015-05-20");
        profile.put("placeOfBirth", "Sri Lanka");
        
        profile.put("licenseNumber", licence != null && licence.getLicenceNumber() != null ? licence.getLicenceNumber() : "DL-" + user.getNic() + "-X");
        profile.put("bloodGroup", licence != null && licence.getBloodGroup() != null ? licence.getBloodGroup() : "O+");
        profile.put("restrictions", licence != null && licence.getDriverRestrictions() != null ? licence.getDriverRestrictions() : "NONE");
        profile.put("donor", licence != null ? licence.isOrganDonor() : true);
        
        // Add a default vehicle class if none is found, so the back of the card isn't empty
        java.util.List<Object> classes = new java.util.ArrayList<>();
        if (licence != null && licence.getVehicleClasses() != null && !licence.getVehicleClasses().isEmpty()) {
            classes.addAll(licence.getVehicleClasses());
        } else {
            Map<String, Object> defaultClass = new HashMap<>();
            defaultClass.put("classCode", "B");
            defaultClass.put("description", "Dual purpose vehicle");
            defaultClass.put("issuedDate", "2015-05-20");
            defaultClass.put("expiryDate", "2025-05-20");
            classes.add(defaultClass);
        }
        profile.put("vehicleClasses", classes);

        return ResponseEntity.ok(profile);
    }

    // Requests and Responses DTOs
    @lombok.Data
    public static class RegisterRequest {
        private String nic;
        private String password;
        private String email;
        private String phone;
    }

    @lombok.Data
    public static class LoginRequest {
        private String nic;
        private String password;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String fullName;
        private String role;
    }
}
