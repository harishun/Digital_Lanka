package com.digitallanka.backend;

import com.digitallanka.backend.model.User;
import com.digitallanka.backend.model.VehicleAuthorization;
import com.digitallanka.backend.model.Notification;
import com.digitallanka.backend.repository.UserRepository;
import com.digitallanka.backend.repository.VehicleAuthorizationRepository;
import com.digitallanka.backend.repository.NotificationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedData(
			UserRepository userRepository,
			VehicleAuthorizationRepository vehicleAuthorizationRepository,
			NotificationRepository notificationRepository,
			JdbcTemplate jdbcTemplate,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			// Migrate vehicle_authorizations status column if needed
			try {
				jdbcTemplate.execute("ALTER TABLE vehicle_authorizations MODIFY COLUMN status VARCHAR(50)");
				System.out.println("--- DB SCHEMA MIGRATED: Altered vehicle_authorizations status column to VARCHAR(50)");
			} catch (Exception e) {
				System.err.println("--- DB SCHEMA MIGRATION SKIPPED: " + e.getMessage());
			}

			// ── Seed application users ────────────────────────────────────────
			// (Users are now seeded by DatabaseSeeder.java, which completely wipes
            // and repopulates the users table to fix any bad data left behind.)

            String targetNic = "197204509123";
            String pereraNic = "199003402948";

			// ── Seed default authorizations ───────────────────────────────────
			// vehicleId uses plate number as the canonical identifier.

			if (vehicleAuthorizationRepository.findById("auth_seed_1").isEmpty()) {
				VehicleAuthorization auth1 = new VehicleAuthorization();
				auth1.setId("auth_seed_1");
				auth1.setVehicleId("WP LA-9999");
				auth1.setOwnerNic(targetNic);
				auth1.setAuthorizedNic(pereraNic);
				auth1.setAccessType(VehicleAuthorization.AccessType.PERMANENT);
				auth1.setStatus(VehicleAuthorization.Status.PENDING);
				vehicleAuthorizationRepository.save(auth1);
				System.out.println("--- SEEDED PENDING AUTHORIZATION: auth_seed_1");

				if (notificationRepository.findById("notif_seed_1").isEmpty()) {
					Notification notif = new Notification();
					notif.setId("notif_seed_1");
					notif.setRecipientNic(pereraNic);
					notif.setTitle("Driving License Authorization Request");
					notif.setMessage("W.M. Sugathadasa has invited you to drive Toyota Prius (Grey) [WP LA-9999].");
					notif.setType(Notification.Type.INVITATION);
					notif.setReferenceId("auth_seed_1");
					notif.setRead(false);
					notificationRepository.save(notif);
					System.out.println("--- SEEDED INVITATION NOTIFICATION: notif_seed_1");
				}
			}

			if (vehicleAuthorizationRepository.findById("auth_seed_2").isEmpty()) {
				VehicleAuthorization auth2 = new VehicleAuthorization();
				auth2.setId("auth_seed_2");
				auth2.setVehicleId("WP LA-9999");
				auth2.setOwnerNic(targetNic);
				auth2.setAuthorizedNic("198503402948");
				auth2.setAccessType(VehicleAuthorization.AccessType.PERMANENT);
				auth2.setStatus(VehicleAuthorization.Status.GRANTED);
				vehicleAuthorizationRepository.save(auth2);
				System.out.println("--- SEEDED GRANTED AUTHORIZATION: auth_seed_2");
			}

			if (notificationRepository.findById("notif_seed_2").isEmpty()) {
				Notification notif2 = new Notification();
				notif2.setId("notif_seed_2");
				notif2.setRecipientNic(targetNic);
				notif2.setTitle("Insurance Policy Renewed");
				notif2.setMessage("Your policy INS-PR-99281-01 for Toyota Prius [WP LA-9999] was successfully verified by underwriter SLIC.");
				notif2.setType(Notification.Type.GENERAL);
				notif2.setRead(false);
				notificationRepository.save(notif2);
				System.out.println("--- SEEDED GENERAL NOTIFICATION: notif_seed_2");
			}
		};
	}
}
