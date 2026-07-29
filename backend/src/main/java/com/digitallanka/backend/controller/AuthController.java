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
        CitizenResponse citizen = govApiClient.getCitizenByNic(request.getNic())
                .orElseThrow(() -> new IllegalArgumentException("NIC number not found in DRP citizen registry. Registration denied."));

        // 2. Axiom 3: Profile remains locked unless a valid driving licence is active in DMT
        Optional<DrivingLicenceResponse> licenceOpt = govApiClient.getDrivingLicenceByNic(request.getNic());
        if (licenceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new VehicleController.ErrorResponse("Operational profile remains locked until a valid driving licence is active."));
        }

        // 3. Prevent duplicate registration
        if (userRepository.findById(request.getNic()).isPresent()) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("An account is already registered for this NIC."));
        }

        // 4. Create User entity with hashed password and details from DRP
        User user = new User();
        user.setNic(request.getNic());
        user.setFullName(citizen.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.ROLE_USER); // Default signup role
        user.setActive(true);
        userRepository.save(user);

        // 5. Generate and return JWT with custom claims (User Name, NIC, Role)
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getNic())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())))
                .build();
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", user.getFullName());
        claims.put("nic", user.getNic());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(claims, userDetails);
        return ResponseEntity.ok(new AuthResponse(token, user.getFullName(), user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findById(request.getNic()).orElse(null);
        
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new VehicleController.ErrorResponse("Invalid NIC or password."));
        }

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getNic())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())))
                .build();

        Map<String, Object> claims = new HashMap<>();
        claims.put("name", user.getFullName());
        claims.put("nic", user.getNic());
        claims.put("role", user.getRole().name());

        String token = jwtService.generateToken(claims, userDetails);
        return ResponseEntity.ok(new AuthResponse(token, user.getFullName(), user.getRole().name()));
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
