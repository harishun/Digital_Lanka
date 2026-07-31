package com.digitallanka.institutionalprovisioning.service.impl;

import com.digitallanka.institutionalprovisioning.dto.LoginRequestDto;
import com.digitallanka.institutionalprovisioning.dto.LoginResponseDto;
import com.digitallanka.institutionalprovisioning.entity.User;
import com.digitallanka.institutionalprovisioning.repository.UserRepository;
import com.digitallanka.institutionalprovisioning.security.JwtUtil;
import com.digitallanka.institutionalprovisioning.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getNic(),
                            loginRequest.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid NIC or password");
        }

        User user = userRepository.findByNic(loginRequest.getNic())
                .orElseThrow(() -> new BadCredentialsException("Invalid NIC or password"));

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getNic(),
                user.getRole().name(),
                user.getFullName()
        );

        return new LoginResponseDto(
                token,
                user.getId(),
                user.getNic(),
                user.getFullName(),
                user.getRole().name()
        );
    }
}
