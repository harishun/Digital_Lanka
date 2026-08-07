package com.digitallanka.backend.config;

import com.digitallanka.backend.model.User;
import com.digitallanka.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("--- SEEDING DATABASE WITH RELEVANT DATA ---");
        
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP COLUMN full_name");
            System.out.println("--- DB SCHEMA MIGRATED: Dropped full_name from users table");
        } catch (Exception e) {
            System.err.println("--- DB SCHEMA MIGRATION SKIPPED: " + e.getMessage());
        }
        
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role ENUM('ROLE_CITIZEN', 'ROLE_OFFICER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN') NOT NULL");
            System.out.println("--- DB SCHEMA MIGRATED: Altered role ENUM to include ROLE_CITIZEN");
        } catch (Exception e) {
            System.err.println("--- DB ENUM MIGRATION SKIPPED: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");
            jdbcTemplate.execute("TRUNCATE TABLE users");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=1");
        } catch (Exception e) {
            System.err.println("--- DB TRUNCATE SKIPPED: " + e.getMessage());
        }

        String defaultPassword = passwordEncoder.encode("dev_test@123");

        // 1. Super Admin
        User superAdmin = new User();
        superAdmin.setNic("197204509123");
        superAdmin.setEmail("sugathadasa@digitallanka.gov.lk");
        superAdmin.setPhone("0777654321");
        superAdmin.setPassword(defaultPassword);
        superAdmin.setRole(User.Role.ROLE_SUPER_ADMIN);
        superAdmin.setActive(true);
        userRepository.save(superAdmin);

        // 2. Admin
        User admin = new User();
        admin.setNic("198503402948");
        admin.setEmail("arjun@gmail.com");
        admin.setPhone("0772345678");
        admin.setPassword(defaultPassword);
        admin.setRole(User.Role.ROLE_ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        // 3. Officer
        User officer = new User();
        officer.setNic("197828430012");
        officer.setEmail("jayasuriya@police.gov.lk");
        officer.setPhone("0775678901");
        officer.setPassword(defaultPassword);
        officer.setRole(User.Role.ROLE_OFFICER);
        officer.setActive(true);
        userRepository.save(officer);

        // 4. Citizen
        User citizen = new User();
        citizen.setNic("199003402948"); // K.A. Don Perera
        citizen.setEmail("citizen@digital.lk");
        citizen.setPassword(passwordEncoder.encode("dev_test@123"));
        citizen.setPhone("0712233445");
        citizen.setRole(User.Role.ROLE_CITIZEN); // ROLE_CITIZEN
        citizen.setActive(true);
        userRepository.save(citizen);
        
        System.out.println("--- SEEDING COMPLETE ---");
    }
}
