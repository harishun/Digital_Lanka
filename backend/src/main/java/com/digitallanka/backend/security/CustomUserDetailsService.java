package com.digitallanka.backend.security;

import com.digitallanka.backend.entity.Role;
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

        Role role = user.getRole() != null ? user.getRole() : Role.ROLE_CITIZEN;

        // No password is checked while login is disabled, but UserDetails requires
        // a non-null value. Kept as the stored hash so the real login can verify it.
        String password = user.getPassword() != null ? user.getPassword() : "";

        return new org.springframework.security.core.userdetails.User(
                user.getNic(),
                password,
                Collections.singletonList(new SimpleGrantedAuthority(role.toAuthority()))
        );
    }
}
