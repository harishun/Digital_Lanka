package com.digitallanka.backend.security;

import com.digitallanka.backend.entity.User;
import com.digitallanka.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String nic) throws UsernameNotFoundException {
        User user = userRepository.findByNic(nic)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with nic: " + nic));

        String password = user.getPassword();
        if (password == null || password.isEmpty()) {
            password = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG"; // default bcrypt for "password"
        }

        String roleName = user.getRole() != null ? user.getRole().name() : "ROLE_CITIZEN";
        if (!roleName.startsWith("ROLE_")) {
            if ("POLICE_OFFICER".equals(roleName)) roleName = "ROLE_OFFICER";
            else if ("ROOT_ADMIN".equals(roleName)) roleName = "ROLE_ADMIN";
            else roleName = "ROLE_" + roleName;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getNic(),
                password,
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}
