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

    private static final Map<String, String> MOCK_CITIZENS = Map.of(
        "197204509123", "W.M. SUGATHADASA",
        "198503402948", "ARJUN RANAWEERA",
        "199003402948", "K.A. DON PERERA",
        "198012304958", "MAHINDA RATHNAYAKE",
        "199556708123", "THARINDU JAYASURIYA",
        "200508901234", "SHENALI PERERA"
    );

    @PostMapping("/check-nic")
    public ResponseEntity<?> checkNic(@RequestBody CheckNicRequest request) {
        String nic = request.getNic();
        if (!isValidNic(nic)) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("Invalid NIC format. Must be 9 digits followed by V/X or 12 digits."));
        }

        // Check duplicate registration
        if (userRepository.findById(nic).isPresent()) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("An account is already registered for this NIC."));
        }

        // Verify citizen registration exists in DRP mock database
        CitizenResponse citizen = govApiClient.getCitizenByNic(nic)
                .orElseGet(() -> {
                    if (MOCK_CITIZENS.containsKey(nic)) {
                        CitizenResponse res = new CitizenResponse();
                        res.setNic(nic);
                        res.setFullName(MOCK_CITIZENS.get(nic));
                        return res;
                    }
                    return null;
                });
        if (citizen == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new VehicleController.ErrorResponse("NIC number not found in DRP citizen registry. Registration denied."));
        }

        // Verify driving licence is active in DMT
        Optional<DrivingLicenceResponse> licenceOpt = govApiClient.getDrivingLicenceByNic(nic);
        if (licenceOpt.isEmpty() && !MOCK_CITIZENS.containsKey(nic)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new VehicleController.ErrorResponse("Operational profile remains locked until a valid driving licence is active."));
        }

        return ResponseEntity.ok(new CheckNicResponse(nic, citizen.getFullName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        
        // NIC validation
        if (!isValidNic(request.getNic())) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("Invalid NIC format. Must be 9 digits followed by V/X or 12 digits."));
        }

        // Password match check
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new VehicleController.ErrorResponse("Passwords do not match."));
        }
        
        // 1. Axiom 1: Verify citizen registration exists in DRP mock database over REST
        CitizenResponse citizen = govApiClient.getCitizenByNic(request.getNic())
                .orElseGet(() -> {
                    if (MOCK_CITIZENS.containsKey(request.getNic())) {
                        CitizenResponse res = new CitizenResponse();
                        res.setNic(request.getNic());
                        res.setFullName(MOCK_CITIZENS.get(request.getNic()));
                        return res;
                    }
                    throw new IllegalArgumentException("NIC number not found in DRP citizen registry. Registration denied.");
                });

        // 2. Axiom 3: Profile remains locked unless a valid driving licence is active in DMT
        Optional<DrivingLicenceResponse> licenceOpt = govApiClient.getDrivingLicenceByNic(request.getNic());
        if (licenceOpt.isEmpty() && !MOCK_CITIZENS.containsKey(request.getNic())) {
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

    private boolean isValidNic(String nic) {
        if (nic == null) return false;
        return nic.matches("^[0-9]{9}[vVxX]$") || nic.matches("^[0-9]{12}$");
    }

    // Requests and Responses DTOs
    @lombok.Data
    public static class CheckNicRequest {
        private String nic;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class CheckNicResponse {
        private String nic;
        private String fullName;
    }

    @lombok.Data
    public static class RegisterRequest {
        private String nic;
        private String password;
        private String confirmPassword;
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
