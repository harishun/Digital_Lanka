package com.digitallanka.backend.controller;

import com.digitallanka.backend.dto.*;
import com.digitallanka.backend.entity.*;
import com.digitallanka.backend.repository.*;
import com.digitallanka.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import com.digitallanka.backend.util.FileUploadUtil;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/enforcement")
public class EnforcementController {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CitationRepository citationRepository;

    // 1. Search endpoint to initiate the 5-min session
    @PostMapping("/search")
    public ResponseEntity<?> searchCompliance(@RequestParam("plateNo") String plateNo,
                                              @RequestParam("dlNo") String dlNo,
                                              @RequestParam(value = "plateImage", required = false) MultipartFile plateImage) {
        
        try {
            if (plateImage != null && !plateImage.isEmpty()) {
                FileUploadUtil.saveFile("uploads/plates", plateImage);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload plate image");
        }

        // Find vehicle and license (by DL No or Driver NIC No) to ensure they exist
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByPlateNo(plateNo);
        Optional<License> licenseOpt = licenseRepository.findByDlNo(dlNo);
        if (licenseOpt.isEmpty()) {
            licenseOpt = licenseRepository.findByDriverNic(dlNo);
        }

        if (vehicleOpt.isEmpty() || licenseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Vehicle or License not found");
        }

        String resolvedDlNo = licenseOpt.get().getDlNo();
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Generate a 5-minute time-locked JWT specifically for this session
        String sessionToken = jwtUtils.generateEnforcementToken(
                userDetails.getUsername(), 
                plateNo, 
                resolvedDlNo
        );

        return ResponseEntity.ok(new JwtResponse(sessionToken, "ENFORCEMENT_SESSION"));
    }

    // 2. Fetch details for display (Requires the 5-min session token)
    @GetMapping("/details")
    public ResponseEntity<?> getDetails(HttpServletRequest request) {
        String jwt = (String) request.getAttribute("jwt");
        if (jwt == null || !"ENFORCEMENT".equals(jwtUtils.extractClaimAsString(jwt, "type"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid or expired enforcement session");
        }

        String plateNo = jwtUtils.extractClaimAsString(jwt, "plateNo");
        String dlNo = jwtUtils.extractClaimAsString(jwt, "dlNo");

        Vehicle vehicle = vehicleRepository.findByPlateNo(plateNo).orElse(null);
        License license = licenseRepository.findByDlNo(dlNo).orElse(null);

        if (vehicle == null || license == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Data not found");
        }

        User driver = license.getDriver();

        EnforcementDetailsResponse response = EnforcementDetailsResponse.builder()
                .driverNic(driver.getNic())
                .driverName(driver.getName())
                .bloodGroup(driver.getBloodGroup())
                .dlNo(license.getDlNo())
                .validOperators(license.getValidOperators())
                .plateNo(vehicle.getPlateNo())
                .insuranceStatus(vehicle.getInsuranceStatus())
                .revenueStatus(vehicle.getRevenueStatus())
                .status(vehicle.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }

    // 3. Issue citation (Requires the 5-min session token)
    @PostMapping("/citation")
    public ResponseEntity<?> issueCitation(@RequestBody CitationRequest citationRequest, HttpServletRequest request) {
        String jwt = (String) request.getAttribute("jwt");
        if (jwt == null || !"ENFORCEMENT".equals(jwtUtils.extractClaimAsString(jwt, "type"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Privacy lockout: Time limit exceeded.");
        }

        String dlNo = jwtUtils.extractClaimAsString(jwt, "dlNo");
        Optional<License> licenseOpt = licenseRepository.findByDlNo(dlNo);

        if (licenseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Driver not found");
        }

        User offender = licenseOpt.get().getDriver();

        String refNum = "CIT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Citation citation = Citation.builder()
                .referenceNumber(refNum)
                .offender(offender)
                .violationType(citationRequest.getViolationType())
                .gpsCoordinates(citationRequest.getGpsCoordinates())
                .timestamp(LocalDateTime.now()) // Exact exact timestamp lockdown
                .status(CitationStatus.PENDING_PAYMENT)
                .build();

        citationRepository.save(citation);

        return ResponseEntity.ok("Citation issued successfully. Ref: " + refNum);
    }
}
