package com.digitallanka.backend.controller;

import com.digitallanka.backend.client.GovApiClient;
import com.digitallanka.backend.dto.CitationRequest;
import com.digitallanka.backend.dto.DrivingLicenceResponse;
import com.digitallanka.backend.dto.EnforcementDetailsResponse;
import com.digitallanka.backend.dto.LicenceVehicleClassResponse;
import com.digitallanka.backend.dto.VehicleDocumentsResponse;
import com.digitallanka.backend.dto.VehicleRegistrationResponse;
import com.digitallanka.backend.entity.Citation;
import com.digitallanka.backend.entity.CitationStatus;
import com.digitallanka.backend.model.Notification;
import com.digitallanka.backend.model.User;
import com.digitallanka.backend.repository.CitationRepository;
import com.digitallanka.backend.repository.NotificationRepository;
import com.digitallanka.backend.repository.UserRepository;
import com.digitallanka.backend.security.EnforcementSessionService;
import com.digitallanka.backend.security.EnforcementSessionService.EnforcementSession;
import com.digitallanka.backend.service.StolenTrackingService;
import com.digitallanka.backend.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * EnforcementController — roadside compliance checks and penalty citations.
 *
 * <p>Every endpoint after {@code /search} requires a valid five-minute stop token
 * (see {@link EnforcementSessionService}). That token — not the request body —
 * is the source of truth for which vehicle and which driver are being acted on,
 * so an officer cannot open a stop for one car and then issue a citation against
 * another.
 *
 * <p>Reference data (citizen, licence, vehicle) is read live from the DRP and DMT
 * government mock APIs through {@link GovApiClient}. Only application data —
 * citations, notifications, theft cases — lives in the local database.
 */
@RestController
@RequestMapping("/api/enforcement")
public class EnforcementController {

    @Autowired
    private EnforcementSessionService sessionService;

    @Autowired
    private GovApiClient govApiClient;

    @Autowired
    private CitationRepository citationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StolenTrackingService stolenTrackingService;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Open a stop — the only endpoint that does not need a session token
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/enforcement/search
     *
     * <p>Verifies the vehicle and driver exist, then mints a five-minute token
     * scoped to that pair. The optional plate photograph is stored as evidence.
     */
    @PostMapping("/search")
    public ResponseEntity<?> openStop(@RequestParam("plateNo") String plateNo,
                                      @RequestParam("driverNic") String driverNic,
                                      @RequestParam(value = "plateImage", required = false) MultipartFile plateImage) {

        String officerNic = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<VehicleRegistrationResponse> vehicleOpt = govApiClient.getVehicleByPlate(plateNo.trim());
        if (vehicleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Vehicle " + plateNo + " not found in government records.");
        }

        Optional<DrivingLicenceResponse> licenceOpt = govApiClient.getDrivingLicenceByNic(driverNic.trim());
        if (licenceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No driving licence found for NIC " + driverNic + ".");
        }

        // Evidence photo is best-effort: a failed upload must not block the stop.
        if (plateImage != null && !plateImage.isEmpty()) {
            try {
                FileUploadUtil.saveFile("uploads/plates", plateImage);
            } catch (Exception e) {
                System.out.println("WARN: could not save plate image: " + e.getMessage());
            }
        }

        String sessionToken = sessionService.openSession(officerNic, plateNo.trim(), driverNic.trim());

        return ResponseEntity.ok(new SessionResponse(sessionToken, 300));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Everything below is gated by the stop token
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/enforcement/details
     *
     * <p>Returns the driver and vehicle compliance record. Note the plate and NIC
     * come from the <b>token</b>, never from the request — that is the scope
     * guarantee in code.
     */
    @GetMapping("/details")
    public ResponseEntity<?> getDetails(
            @RequestHeader(value = EnforcementSessionService.SESSION_HEADER, required = false) String sessionToken) {

        Optional<EnforcementSession> sessionOpt = sessionService.readSession(sessionToken);
        if (sessionOpt.isEmpty()) {
            return privacyLockout();
        }
        EnforcementSession session = sessionOpt.get();

        DrivingLicenceResponse licence = govApiClient.getDrivingLicenceByNic(session.getDriverNic()).orElse(null);
        VehicleRegistrationResponse vehicle = govApiClient.getVehicleByPlate(session.getPlateNo()).orElse(null);

        if (licence == null || vehicle == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Government records unavailable for this stop.");
        }

        // Licence classes → "A1, A, B"
        String validOperators = licence.getVehicleClasses() == null ? ""
                : licence.getVehicleClasses().stream()
                        .map(LicenceVehicleClassResponse::getClassCode)
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.joining(", "));

        // Insurance and revenue come from the DMT documents endpoint when available.
        String insuranceStatus = "UNKNOWN";
        String revenueStatus = "UNKNOWN";
        Optional<VehicleDocumentsResponse> docsOpt = govApiClient.getVehicleDocuments(session.getPlateNo());
        if (docsOpt.isPresent()) {
            VehicleDocumentsResponse docs = docsOpt.get();
            if (docs.getInsurance() != null) {
                insuranceStatus = isInFuture(docs.getInsurance().getExpiryDate()) ? "VALID" : "EXPIRED";
            }
            if (docs.getRevenue() != null) {
                revenueStatus = docs.getRevenue().getStatus() != null
                        ? docs.getRevenue().getStatus()
                        : (isInFuture(docs.getRevenue().getExpiryDate()) ? "VALID" : "EXPIRED");
            }
        }

        String vehicleStatus = stolenTrackingService.isStolenVehicle(session.getPlateNo()) ? "STOLEN" : "ACTIVE";

        EnforcementDetailsResponse response = EnforcementDetailsResponse.builder()
                .driverNic(licence.getNic())
                .driverName(licence.getFullNameOnCard())
                .bloodGroup(licence.getBloodGroup())
                .dlNo(licence.getLicenceNumber())
                .validOperators(validOperators)
                .plateNo(vehicle.getPlateNumber())
                .insuranceStatus(insuranceStatus)
                .revenueStatus(revenueStatus)
                .status(vehicleStatus)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/enforcement/citation
     *
     * <p>Issues a penalty citation against the <b>driver</b> named in the token.
     * The citation is recorded against the officer from the token's subject, so
     * every fine is attributable.
     */
    @PostMapping("/citation")
    public ResponseEntity<?> issueCitation(
            @RequestHeader(value = EnforcementSessionService.SESSION_HEADER, required = false) String sessionToken,
            @RequestBody CitationRequest request) {

        Optional<EnforcementSession> sessionOpt = sessionService.readSession(sessionToken);
        if (sessionOpt.isEmpty()) {
            return privacyLockout();
        }
        EnforcementSession session = sessionOpt.get();

        // The offender must have an application account to receive and pay the fine.
        Optional<User> offenderOpt = userRepository.findByNic(session.getDriverNic());
        if (offenderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Driver " + session.getDriverNic() + " has no Digital Lanka account, so a citation cannot be issued.");
        }

        String refNum = "CIT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Citation citation = Citation.builder()
                .referenceNumber(refNum)
                .offender(offenderOpt.get())
                .plateNumber(session.getPlateNo())          // from the token, not the client
                .violationType(request.getViolationType())
                .gpsCoordinates(request.getGpsCoordinates())
                .fineAmount(request.getFineAmount())
                .officerNic(session.getOfficerNic())        // from the token, not the client
                .timestamp(LocalDateTime.now())             // server time — cannot be forged
                .status(CitationStatus.PENDING_PAYMENT)
                .build();

        citationRepository.save(citation);

        notificationRepository.save(buildNotification(
                session.getDriverNic(),
                "Penalty Citation Issued — " + refNum,
                "A penalty citation has been issued against you by Roadside Law Enforcement for vehicle "
                        + session.getPlateNo() + ". Violation: " + request.getViolationType()
                        + ". Reference: " + refNum
                        + ". Please settle the fine and upload your payment receipt under 'My Citations'.",
                refNum));

        return ResponseEntity.ok(citation);
    }

    /**
     * POST /api/enforcement/seizure
     *
     * <p>Records a roadside seizure of a stolen vehicle and alerts the registered
     * <b>owner</b> — not the driver. A citation punishes the person driving; a
     * seizure removes the owner's property, so they are the one who must act.
     */
    @PostMapping("/seizure")
    public ResponseEntity<?> seizeVehicle(
            @RequestHeader(value = EnforcementSessionService.SESSION_HEADER, required = false) String sessionToken) {

        Optional<EnforcementSession> sessionOpt = sessionService.readSession(sessionToken);
        if (sessionOpt.isEmpty()) {
            return privacyLockout();
        }
        EnforcementSession session = sessionOpt.get();

        Optional<VehicleRegistrationResponse> vehicleOpt = govApiClient.getVehicleByPlate(session.getPlateNo());
        if (vehicleOpt.isEmpty() || vehicleOpt.get().getOwnerNic() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Registered owner not found for vehicle " + session.getPlateNo() + ".");
        }

        String ownerNic = vehicleOpt.get().getOwnerNic();

        notificationRepository.save(buildNotification(
                ownerNic,
                "Vehicle Seized — " + session.getPlateNo(),
                "Your vehicle " + session.getPlateNo() + " has been seized by Roadside Law Enforcement "
                        + "after being flagged as stolen in the national database. Please visit your nearest "
                        + "police station with your National Identity Card and vehicle registration documents "
                        + "to begin the release process.",
                session.getPlateNo()));

        return ResponseEntity.ok("Seizure recorded for vehicle " + session.getPlateNo()
                + ". The registered owner has been notified.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private ResponseEntity<String> privacyLockout() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Privacy lockout: this roadside session has expired. Start a new compliance check.");
    }

    private boolean isInFuture(String isoDate) {
        try {
            return java.time.LocalDate.parse(isoDate).isAfter(java.time.LocalDate.now());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Builds an unread inbox alert.
     *
     * <p>Type is {@code GENERAL} deliberately: the {@code notifications.type}
     * column is a MySQL ENUM of INVITATION / STOLEN_ALERT / GENERAL, and the app
     * runs with {@code ddl-auto=none}. Adding CITATION and SEIZURE values would
     * require a schema migration, so GENERAL keeps this working with no DB change.
     */
    private Notification buildNotification(String recipientNic, String title, String message, String referenceId) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setRecipientNic(recipientNic);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(Notification.Type.GENERAL);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        return notification;
    }

    /** Response for {@code /search}: the stop token plus its lifetime in seconds. */
    public static class SessionResponse {
        private final String sessionToken;
        private final int expiresInSeconds;

        public SessionResponse(String sessionToken, int expiresInSeconds) {
            this.sessionToken = sessionToken;
            this.expiresInSeconds = expiresInSeconds;
        }

        public String getSessionToken()  { return sessionToken; }
        public int    getExpiresInSeconds() { return expiresInSeconds; }
    }
}
