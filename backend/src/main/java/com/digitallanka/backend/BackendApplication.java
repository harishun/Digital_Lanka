package com.digitallanka.backend;

import com.digitallanka.backend.model.Notification;
import com.digitallanka.backend.model.User;
import com.digitallanka.backend.model.VehicleAuthorization;
import com.digitallanka.backend.repository.NotificationRepository;
import com.digitallanka.backend.repository.UserRepository;
import com.digitallanka.backend.repository.VehicleAuthorizationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

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
			JdbcTemplate jdbc,
			PasswordEncoder passwordEncoder
	) {
		return args -> {

			// ── 1. Ensure vehicles table exists (Hibernate manages it via ddl-auto=update) ─
			// MySQL dialect + ddl-auto=update will auto-create tables from @Entity classes.
			// The vehicles table is seeded directly via JDBC since Vehicle is not a JPA entity.
			jdbc.execute("""
				CREATE TABLE IF NOT EXISTS vehicles (
				    id            VARCHAR(20)  NOT NULL PRIMARY KEY,
				    plate_number  VARCHAR(20)  NOT NULL UNIQUE,
				    owner_nic     VARCHAR(15)  NOT NULL,
				    model         VARCHAR(100) NOT NULL,
				    vehicle_class VARCHAR(5)   NOT NULL DEFAULT 'B',
				    fuel_type     VARCHAR(50)  NOT NULL DEFAULT 'Petrol / Hybrid',
				    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
				    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
				)
			""");

			// ── 2. Purge legacy test data ─────────────────────────────────────
			try {
				jdbc.execute("DELETE FROM vehicle_authorizations WHERE owner_nic = '200331910202' OR authorized_nic = '200331910202'");
				jdbc.execute("DELETE FROM notifications WHERE recipient_nic = '200331910202'");
				jdbc.execute("DELETE FROM theft_cases WHERE reporter_nic = '200331910202'");
				jdbc.execute("DELETE FROM users WHERE nic = '200331910202'");
				System.out.println("--- DB CLEANUP: Purged all legacy records for NIC 200331910202");
			} catch (Exception e) {
				System.err.println("--- DB CLEANUP SKIPPED: " + e.getMessage());
			}

			// ── 3. Seed Users ─────────────────────────────────────────────────
			seedUserIfAbsent(userRepository, passwordEncoder, "197204509123", "W.M. SUGATHADASA",    "sugathadasa@gmail.com",  "0777654321", User.Role.ROLE_ADMIN);
			seedUserIfAbsent(userRepository, passwordEncoder, "198503402948", "ARJUN RANAWEERA",     "arjun@gmail.com",        "0772345678", User.Role.ROLE_USER);
			seedUserIfAbsent(userRepository, passwordEncoder, "199003402948", "K.A. DON PERERA",     "perera@gmail.com",       "0773456789", User.Role.ROLE_USER);
			seedUserIfAbsent(userRepository, passwordEncoder, "198012304958", "MAHINDA RATHNAYAKE",  "mahinda@gmail.com",      "0774567890", User.Role.ROLE_USER);
			seedUserIfAbsent(userRepository, passwordEncoder, "199556708123", "THARINDU JAYASURIYA", "tharindu@gmail.com",     "0775678901", User.Role.ROLE_USER);
			seedUserIfAbsent(userRepository, passwordEncoder, "200508901234", "SHENALI PERERA",      "shenali@gmail.com",      "0776789012", User.Role.ROLE_USER);
			seedUserIfAbsent(userRepository, passwordEncoder, "OFFICER_001",  "INSPECTOR BANDARA",   "bandara@police.gov.lk",  "0779998877", User.Role.ROLE_OFFICER);

			// ── 4. Seed Vehicles (matching 01_digital_lanka_app_db.sql) ───────
			seedVehicleIfAbsent(jdbc, "WP LA-9999",  "WP LA-9999",  "197204509123", "Toyota Prius (Grey)",                   "B",  "Petrol / Hybrid", "ACTIVE");
			seedVehicleIfAbsent(jdbc, "WP CAD-1234", "WP CAD-1234", "197204509123", "Honda Vezel (White)",                   "B",  "Petrol / Hybrid", "STOLEN");
			seedVehicleIfAbsent(jdbc, "WP CBA-5678", "WP CBA-5678", "197204509123", "Toyota Aqua (Blue)",                    "B",  "Petrol / Hybrid", "ACTIVE");
			seedVehicleIfAbsent(jdbc, "WP BC-5544",  "WP BC-5544",  "198503402948", "Yamaha FZ (Black)",                     "A",  "Petrol",          "ACTIVE");
			seedVehicleIfAbsent(jdbc, "WP KD-4321",  "WP KD-4321",  "199003402948", "Suzuki Wagon R (Red)",                  "B",  "Petrol",          "ACTIVE");
			seedVehicleIfAbsent(jdbc, "WP ND-8877",  "WP ND-8877",  "198012304958", "Isuzu Commercial Heavy Lorry (White)",  "CE", "Diesel",          "ACTIVE");
			seedVehicleIfAbsent(jdbc, "WP NB-3322",  "WP NB-3322",  "199556708123", "Ashok Leyland Passenger Bus (Red)",     "D",  "Diesel",          "ACTIVE");
			seedVehicleIfAbsent(jdbc, "WP PH-7711",  "WP PH-7711",  "200508901234", "Nissan Leaf EV (Silver)",               "B",  "Electric",        "ACTIVE");

			// ── 5. Seed Vehicle Authorizations ───────────────────────────────
			seedAuthIfAbsent(vehicleAuthorizationRepository, "auth_101",    "WP LA-9999",  "197204509123", "198503402948", VehicleAuthorization.AccessType.PERMANENT,  VehicleAuthorization.Status.GRANTED);
			seedAuthIfAbsent(vehicleAuthorizationRepository, "auth_102",    "WP LA-9999",  "197204509123", "199003402948", VehicleAuthorization.AccessType.TIME_BOUND, VehicleAuthorization.Status.PENDING);
			seedAuthIfAbsent(vehicleAuthorizationRepository, "auth_103",    "WP BC-5544",  "198503402948", "197204509123", VehicleAuthorization.AccessType.PERMANENT,  VehicleAuthorization.Status.GRANTED);
			seedAuthIfAbsent(vehicleAuthorizationRepository, "auth_104",    "WP KD-4321",  "199003402948", "200508901234", VehicleAuthorization.AccessType.TIME_BOUND, VehicleAuthorization.Status.DECLINED);
			seedAuthIfAbsent(vehicleAuthorizationRepository, "auth_seed_1", "WP LA-9999",  "197204509123", "199003402948", VehicleAuthorization.AccessType.PERMANENT,  VehicleAuthorization.Status.PENDING);
			seedAuthIfAbsent(vehicleAuthorizationRepository, "auth_seed_2", "WP LA-9999",  "197204509123", "198503402948", VehicleAuthorization.AccessType.PERMANENT,  VehicleAuthorization.Status.GRANTED);

			// ── 6. Seed Notifications ────────────────────────────────────────
			seedNotifIfAbsent(notificationRepository, "notif_001",    "198503402948", "Driving Access Granted",
					"W.M. SUGATHADASA has authorized PERMANENT access to drive vehicle WP LA-9999.", Notification.Type.INVITATION, "auth_101");
			seedNotifIfAbsent(notificationRepository, "notif_002",    "199003402948", "New Driving Access Invitation",
					"W.M. SUGATHADASA (Root Admin) invited you to drive vehicle WP LA-9999 (TIME_BOUND Access).", Notification.Type.INVITATION, "auth_102");
			seedNotifIfAbsent(notificationRepository, "notif_003",    "197204509123", "Stolen Vehicle Alert",
					"Vehicle WP CAD-1234 has been flagged as STOLEN in the Application Database.", Notification.Type.STOLEN_ALERT, "WP CAD-1234");
			seedNotifIfAbsent(notificationRepository, "notif_seed_1", "199003402948", "Driving License Authorization Request",
					"W.M. Sugathadasa has invited you to drive Toyota Prius (Grey) [WP LA-9999].", Notification.Type.INVITATION, "auth_seed_1");
			seedNotifIfAbsent(notificationRepository, "notif_seed_2", "197204509123", "Insurance Policy Renewed",
					"Your policy INS-PR-99281-01 for Toyota Prius [WP LA-9999] was successfully verified by underwriter SLIC.", Notification.Type.GENERAL, null);

			// ── 7. Seed Theft Case (WP CAD-1234 is STOLEN per SQL file) ──────
			seedTheftCaseIfAbsent(jdbc, "log_001", "WP CAD-1234", "197204509123",
					"Vehicle reported missing by owner W.M. Sugathadasa.");

			System.out.println("=== DB SEEDING COMPLETE ===");
		};
	}

	// ─── Helpers ─────────────────────────────────────────────────────────────

	private void seedUserIfAbsent(UserRepository repo, PasswordEncoder enc,
			String nic, String fullName, String email, String phone, User.Role role) {
		if (repo.findById(nic).isEmpty()) {
			User u = new User();
			u.setNic(nic);
			u.setFullName(fullName);
			u.setEmail(email);
			u.setPhone(phone);
			u.setPassword(enc.encode("dev_test@123"));
			u.setRole(role);
			u.setActive(true);
			repo.save(u);
			System.out.println("--- SEEDED USER: " + nic + " (" + fullName + ")");
		}
	}

	private void seedVehicleIfAbsent(JdbcTemplate jdbc, String id, String plate,
			String ownerNic, String model, String vehicleClass, String fuelType, String status) {
		Integer count = jdbc.queryForObject(
				"SELECT COUNT(*) FROM vehicles WHERE id = ?", Integer.class, id);
		if (count == null || count == 0) {
			jdbc.update(
				"INSERT INTO vehicles (id, plate_number, owner_nic, model, vehicle_class, fuel_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
				id, plate, ownerNic, model, vehicleClass, fuelType, status);
			System.out.println("--- SEEDED VEHICLE: " + plate + " [" + status + "]");
		}
	}

	private void seedAuthIfAbsent(VehicleAuthorizationRepository repo, String id,
			String vehicleId, String ownerNic, String authNic,
			VehicleAuthorization.AccessType type, VehicleAuthorization.Status status) {
		if (repo.findById(id).isEmpty()) {
			VehicleAuthorization a = new VehicleAuthorization();
			a.setId(id);
			a.setVehicleId(vehicleId);
			a.setOwnerNic(ownerNic);
			a.setAuthorizedNic(authNic);
			a.setAccessType(type);
			a.setStatus(status);
			repo.save(a);
			System.out.println("--- SEEDED AUTHORIZATION: " + id);
		}
	}

	private void seedNotifIfAbsent(NotificationRepository repo, String id,
			String recipientNic, String title, String message,
			Notification.Type type, String referenceId) {
		if (repo.findById(id).isEmpty()) {
			Notification n = new Notification();
			n.setId(id);
			n.setRecipientNic(recipientNic);
			n.setTitle(title);
			n.setMessage(message);
			n.setType(type);
			n.setReferenceId(referenceId);
			n.setRead(false);
			repo.save(n);
			System.out.println("--- SEEDED NOTIFICATION: " + id + " -> " + recipientNic);
		}
	}

	private void seedTheftCaseIfAbsent(JdbcTemplate jdbc, String id,
			String vehicleId, String reporterNic, String remarks) {
		Integer count = jdbc.queryForObject(
				"SELECT COUNT(*) FROM theft_cases WHERE id = ?", Integer.class, id);
		if (count == null || count == 0) {
			jdbc.update(
				"INSERT INTO theft_cases (id, vehicle_id, reporter_nic, reported_at, status, remarks) VALUES (?, ?, ?, NOW(), 'PENDING', ?)",
				id, vehicleId, reporterNic, remarks);
			System.out.println("--- SEEDED THEFT CASE: " + id + " for " + vehicleId);
		}
	}
}
