package com.digitallanka.institutionalprovisioning.seed;

import com.digitallanka.institutionalprovisioning.entity.Role;
import com.digitallanka.institutionalprovisioning.entity.User;
import com.digitallanka.institutionalprovisioning.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Super Admin if not already present
        String superAdminEmail = "superadmin@traffic.gov.lk";
        
        boolean superAdminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.SUPER_ADMIN);

        if (!superAdminExists) {
            User superAdmin = new User();
            superAdmin.setNic("000000000V");
            superAdmin.setFullName("System Super Admin");
            superAdmin.setEmail(superAdminEmail);
            superAdmin.setPassword(passwordEncoder.encode("superadmin123"));
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setDepartment("System Provisioning");
            
            userRepository.save(superAdmin);
            System.out.println(">>> Seeded default Super Admin user (NIC: " + superAdmin.getNic() + ", password: superadmin123)");
        } else {
            System.out.println(">>> Super Admin user already exists. Skipping seeding.");
        }
    }
}
