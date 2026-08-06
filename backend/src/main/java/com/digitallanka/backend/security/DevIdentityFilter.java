package com.digitallanka.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * DevIdentityFilter — TEMPORARY identity resolution while login is being rebuilt.
 *
 * <p>This project currently ships without a login screen: the frontend persona
 * switcher decides who the "current user" is and sends that NIC on every request
 * in the {@code X-User-Nic} header. This filter turns that header into a fully
 * populated Spring Security context, using the user's REAL role from the
 * database. Every {@code SecurityContextHolder} call in the controllers, and every
 * authority rule in {@link SecurityConfig}, therefore keeps working unchanged.
 *
 * <p>The 5-minute roadside enforcement session token is NOT login — it is part of
 * the privacy lockout in the citation flow — so it is still honoured here via the
 * {@code Authorization: Bearer} header and takes precedence over the dev header.
 *
 * <p><b>HANDOVER NOTE:</b> when real authentication lands, delete this class and
 * register the new JWT filter in {@link SecurityConfig#filterChain}. Nothing else
 * in the backend needs to change.
 */
@Component
public class DevIdentityFilter extends OncePerRequestFilter {

    public static final String IDENTITY_HEADER = "X-User-Nic";
    private static final String ENFORCEMENT_AUTHORITY = "ENFORCEMENT_SESSION";

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                String bearer = parseBearer(request);
                if (bearer != null) {
                    authenticateEnforcementSession(request, bearer);
                } else {
                    authenticateDevIdentity(request);
                }
            }
        } catch (Exception e) {
            logger.warn("Could not establish identity for request: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Roadside enforcement session: a short-lived, scope-limited token minted by
     * {@code POST /api/enforcement/search}. Grants only ENFORCEMENT_SESSION.
     */
    private void authenticateEnforcementSession(HttpServletRequest request, String jwt) {
        if (!jwtUtils.isValid(jwt) || !"ENFORCEMENT".equals(jwtUtils.extractClaimAsString(jwt, "type"))) {
            // Expired or non-enforcement token: leave the context empty so the
            // request is rejected by SecurityConfig rather than blowing up in
            // the controller when it tries to read the claims.
            return;
        }

        String officerNic = jwtUtils.extractUsername(jwt);
        UserDetails officer = userDetailsService.loadUserByUsername(officerNic);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                officer, null, Collections.singletonList(new SimpleGrantedAuthority(ENFORCEMENT_AUTHORITY)));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        // EnforcementController reads the raw token off the request to check
        // expiry and the plateNo/dlNo claims it was scoped to.
        request.setAttribute("jwt", jwt);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    /**
     * Dev identity: trust the X-User-Nic header and load that user's real role.
     */
    private void authenticateDevIdentity(HttpServletRequest request) {
        String nic = request.getHeader(IDENTITY_HEADER);
        if (!StringUtils.hasText(nic)) {
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(nic.trim());

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String parseBearer(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
