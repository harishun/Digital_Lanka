package com.digitallanka.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * EnforcementSessionService — the roadside "privacy lockout".
 *
 * <p><b>This is not login.</b> {@link JwtService} issues the long-lived token that
 * proves who you are. This class issues a completely separate, short-lived token
 * that proves <i>an officer opened one specific roadside stop</i>.
 *
 * <p>The problem it solves: an officer legitimately needs a citizen's licence,
 * blood group and insurance details at the roadside, but must not be able to
 * browse the population register from a desk. So access is granted in a form
 * that is:
 *
 * <ul>
 *   <li><b>Time-bound</b> — the signed expiry is 5 minutes, baked into the token.</li>
 *   <li><b>Scope-bound</b> — the plate number and driver NIC are signed claims, so
 *       the token authorises exactly one stop and cannot be replayed against a
 *       different vehicle.</li>
 *   <li><b>Tamper-proof</b> — HS256 signature; editing any claim invalidates it.</li>
 *   <li><b>Stateless</b> — nothing is stored server-side, so there is no session
 *       table to clean up and it works across multiple app instances.</li>
 * </ul>
 *
 * <p>The token travels in its own {@code X-Enforcement-Session} header rather than
 * {@code Authorization}, so it sits <i>alongside</i> the officer's login JWT
 * instead of replacing it. The officer stays logged in for the whole shift while
 * each individual stop gets its own five-minute window.
 */
@Service
public class EnforcementSessionService {

    /** Header the officer's browser sends the stop token in. */
    public static final String SESSION_HEADER = "X-Enforcement-Session";

    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_PLATE = "plateNo";
    private static final String CLAIM_DRIVER = "driverNic";
    private static final String TYPE_ENFORCEMENT = "ENFORCEMENT";

    /** Five minutes, in milliseconds. */
    private static final long SESSION_DURATION_MS = 5 * 60 * 1000L;

    // Distinct from the login secret: an enforcement token must never be usable
    // as a login token, or vice versa.
    private static final String SECRET_STRING =
            "9f2c41d8b7e05a63c19d84fb27a6e350d5c81920f47b6ae3c02d95817be4f6ad";
    private final Key signingKey = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    /**
     * Mints a stop token scoped to one vehicle and one driver.
     *
     * @param officerNic the officer who opened the stop (stored as the subject,
     *                   so every citation can be traced back to them)
     */
    public String openSession(String officerNic, String plateNo, String driverNic) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TYPE_ENFORCEMENT);
        claims.put(CLAIM_PLATE, plateNo);
        claims.put(CLAIM_DRIVER, driverNic);

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(officerNic)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + SESSION_DURATION_MS))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a stop token and returns its claims.
     *
     * @return the parsed session, or empty if the token is missing, expired,
     *         tampered with, or is not an enforcement token
     */
    public java.util.Optional<EnforcementSession> readSession(String token) {
        if (token == null || token.isBlank()) {
            return java.util.Optional.empty();
        }
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)   // throws if expired or tampered with
                    .getBody();

            if (!TYPE_ENFORCEMENT.equals(claims.get(CLAIM_TYPE, String.class))) {
                return java.util.Optional.empty();
            }

            return java.util.Optional.of(new EnforcementSession(
                    claims.getSubject(),
                    claims.get(CLAIM_PLATE, String.class),
                    claims.get(CLAIM_DRIVER, String.class),
                    claims.getExpiration()));

        } catch (Exception e) {
            // Expired, bad signature, malformed — all mean "no valid stop".
            return java.util.Optional.empty();
        }
    }

    /** The verified contents of an open roadside stop. */
    public static class EnforcementSession {
        private final String officerNic;
        private final String plateNo;
        private final String driverNic;
        private final Date expiresAt;

        public EnforcementSession(String officerNic, String plateNo, String driverNic, Date expiresAt) {
            this.officerNic = officerNic;
            this.plateNo = plateNo;
            this.driverNic = driverNic;
            this.expiresAt = expiresAt;
        }

        public String getOfficerNic() { return officerNic; }
        public String getPlateNo()    { return plateNo; }
        public String getDriverNic()  { return driverNic; }
        public Date   getExpiresAt()  { return expiresAt; }
    }
}
