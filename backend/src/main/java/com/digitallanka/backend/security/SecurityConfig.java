package com.digitallanka.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;
import java.util.Arrays;

/**
 * SecurityConfig — authorization rules for the API.
 *
 * <p>Authentication itself is currently supplied by {@link DevIdentityFilter}
 * (persona header) rather than a login endpoint. The authorization rules below
 * are the real ones and should survive the login rebuild untouched — only the
 * filter registered on the chain needs to be swapped.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private DevIdentityFilter devIdentityFilter;

    /** Still required by DataSeeder to hash seeded passwords. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth ->
                auth.requestMatchers("/api/assets/public-verify").permitAll()
                    .requestMatchers("/api/enforcement/**").hasAnyAuthority("ROLE_OFFICER", "ENFORCEMENT_SESSION", "ROLE_ADMIN")
                    .requestMatchers("/api/citations/my", "/api/citations/*/pay").hasAnyAuthority("ROLE_CITIZEN", "ROLE_OFFICER", "ROLE_ADMIN")
                    .requestMatchers("/api/citations/verifying", "/api/citations/*/clear").hasAuthority("ROLE_ADMIN")
                    .anyRequest().authenticated()
            );

        // TEMPORARY: replace with the real JWT filter once login is implemented.
        http.addFilterBefore(devIdentityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "authorization", "content-type", "x-auth-token", DevIdentityFilter.IDENTITY_HEADER));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
