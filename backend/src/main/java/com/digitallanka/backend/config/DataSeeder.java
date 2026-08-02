package com.digitallanka.backend.config;

import com.digitallanka.backend.entity.*;
import com.digitallanka.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository, VehicleRepository vehicleRepository, LicenseRepository licenseRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Keep existing default Citizen, Officer, Admin for backward compatibility
            User citizen = userRepository.findByNic("901234567V").orElseGet(() -> {
                User c = User.builder()
                        .nic("901234567V")
                        .name("John Doe")
                        .bloodGroup("A-")
                        .role(Role.ROLE_CITIZEN)
                        .password(passwordEncoder.encode("password"))
                        .build();
                return userRepository.save(c);
            });

            if (userRepository.findByNic("OFFICER123").isEmpty()) {
                User officer = User.builder()
                        .nic("OFFICER123")
                        .name("John Officer")
                        .bloodGroup("O+")
                        .role(Role.ROLE_OFFICER)
                        .password(passwordEncoder.encode("password"))
                        .build();
                userRepository.save(officer);
            }

            if (userRepository.findByNic("ADMIN123").isEmpty()) {
                User admin = User.builder()
                        .nic("ADMIN123")
                        .name("Super Admin")
                        .bloodGroup("B+")
                        .role(Role.ROLE_ADMIN)
                        .password(passwordEncoder.encode("password"))
                        .build();
                userRepository.save(admin);
            }

            if (vehicleRepository.findById("CBA-1234").isEmpty()) {
                Vehicle vehicle = Vehicle.builder()
                        .plateNo("CBA-1234")
                        .plateNumber("CBA-1234")
                        .owner(citizen)
                        .insuranceStatus("VALID")
                        .revenueStatus("EXPIRED")
                        .build();
                vehicleRepository.save(vehicle);
            }

            if (licenseRepository.findByDlNo("DL-987654").isEmpty()) {
                License license = License.builder()
                        .dlNo("DL-987654")
                        .driver(citizen)
                        .validOperators("A, B, B1")
                        .build();
                licenseRepository.save(license);
            }

            // 2. Link & Seed all citizens from Digital_Lanka-dev (01_digital_lanka_app_db.sql & 01_drp_schema.sql)
            User sugathadasa = userRepository.findByNic("197204509123").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("197204509123")
                        .name("W.M. SUGATHADASA")
                        .dateOfBirth(java.time.LocalDate.of(1972, 6, 15))
                        .gender("Male")
                        .address("45, Flower Road, Colombo 07")
                        .placeOfBirth("Colombo General Hospital")
                        .bloodGroup("B+")
                        .donor(true)
                        .role(Role.ROLE_CITIZEN)
                        .vehicleClasses("[{\"classCode\":\"A1\",\"description\":\"Light Motorcycle\",\"issuedDate\":\"1995-04-10\",\"expiryDate\":\"2032-06-15\"},{\"classCode\":\"A\",\"description\":\"Motorcycle\",\"issuedDate\":\"1995-04-10\",\"expiryDate\":\"2032-06-15\"},{\"classCode\":\"B\",\"description\":\"Passenger Car\",\"issuedDate\":\"1995-04-10\",\"expiryDate\":\"2032-06-15\"},{\"classCode\":\"G1\",\"description\":\"Two Wheel Tractor\",\"issuedDate\":\"2000-01-15\",\"expiryDate\":\"2032-06-15\"}]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            User ranaweera = userRepository.findByNic("198503402948").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("198503402948")
                        .name("ARJUN RANAWEERA")
                        .dateOfBirth(java.time.LocalDate.of(1985, 3, 4))
                        .gender("Male")
                        .address("45, Peradeniya Rd, Kandy")
                        .placeOfBirth("Kandy General Hospital")
                        .bloodGroup("A+")
                        .donor(true)
                        .role(Role.CITIZEN)
                        .vehicleClasses("[{\"classCode\":\"A\",\"description\":\"Motorcycle\",\"issuedDate\":\"2003-11-15\",\"expiryDate\":\"2029-11-15\"},{\"classCode\":\"B\",\"description\":\"Passenger Car\",\"issuedDate\":\"2003-11-15\",\"expiryDate\":\"2029-11-15\"}]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            User perera = userRepository.findByNic("199003402948").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("199003402948")
                        .name("K.A. DON PERERA")
                        .dateOfBirth(java.time.LocalDate.of(1990, 11, 20))
                        .gender("Male")
                        .address("12, Matara Rd, Galle")
                        .placeOfBirth("Galle General Hospital")
                        .bloodGroup("B+")
                        .donor(false)
                        .role(Role.CITIZEN)
                        .vehicleClasses("[{\"classCode\":\"B\",\"description\":\"Passenger Car\",\"issuedDate\":\"2008-06-01\",\"expiryDate\":\"2030-06-01\"}]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            User rathnayake = userRepository.findByNic("198012304958").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("198012304958")
                        .name("MAHINDA RATHNAYAKE")
                        .dateOfBirth(java.time.LocalDate.of(1980, 4, 12))
                        .gender("Male")
                        .address("88, Main Street, Kurunegala")
                        .placeOfBirth("Kurunegala Base Hospital")
                        .bloodGroup("O+")
                        .donor(true)
                        .role(Role.CITIZEN)
                        .vehicleClasses("[{\"classCode\":\"C1\",\"description\":\"Light Lorry\",\"issuedDate\":\"2002-03-10\",\"expiryDate\":\"2025-04-12\"},{\"classCode\":\"C\",\"description\":\"Heavy Lorry\",\"issuedDate\":\"2002-03-10\",\"expiryDate\":\"2025-04-12\"},{\"classCode\":\"CE\",\"description\":\"Heavy Lorry Trailer\",\"issuedDate\":\"2005-08-20\",\"expiryDate\":\"2025-04-12\"}]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            User jayasuriya = userRepository.findByNic("199556708123").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("199556708123")
                        .name("THARINDU JAYASURIYA")
                        .dateOfBirth(java.time.LocalDate.of(1995, 9, 8))
                        .gender("Male")
                        .address("23, Bus Stand Rd, Negombo")
                        .placeOfBirth("Negombo Hospital")
                        .bloodGroup("AB+")
                        .donor(true)
                        .role(Role.CITIZEN)
                        .vehicleClasses("[{\"classCode\":\"D1\",\"description\":\"Light Bus\",\"issuedDate\":\"2016-05-10\",\"expiryDate\":\"2031-09-08\"},{\"classCode\":\"D\",\"description\":\"Motor Coach\",\"issuedDate\":\"2016-05-10\",\"expiryDate\":\"2031-09-08\"},{\"classCode\":\"PT\",\"description\":\"Public Transport\",\"issuedDate\":\"2018-01-20\",\"expiryDate\":\"2031-09-08\"}]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            User shenali = userRepository.findByNic("200508901234").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("200508901234")
                        .name("SHENALI PERERA")
                        .dateOfBirth(java.time.LocalDate.of(2005, 2, 14))
                        .gender("Female")
                        .address("101, Galle Road, Dehiwala")
                        .placeOfBirth("Kalubowila Teaching Hospital")
                        .bloodGroup("A-")
                        .donor(true)
                        .role(Role.CITIZEN)
                        .vehicleClasses("[{\"classCode\":\"B\",\"description\":\"Passenger Car\",\"issuedDate\":\"2023-03-01\",\"expiryDate\":\"2033-02-14\"}]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            User officerBandara = userRepository.findByNic("OFFICER_001").orElseGet(() -> {
                return userRepository.save(User.builder()
                        .nic("OFFICER_001")
                        .name("INSPECTOR BANDARA")
                        .dateOfBirth(java.time.LocalDate.of(1978, 10, 10))
                        .gender("Male")
                        .address("Police HQ, Fort, Colombo 01")
                        .placeOfBirth("Colombo General Hospital")
                        .bloodGroup("O+")
                        .donor(true)
                        .role(Role.POLICE_OFFICER)
                        .vehicleClasses("[]")
                        .password(passwordEncoder.encode("password"))
                        .build());
            });

            // 3. Link & Seed all vehicles from Digital_Lanka-dev (01_digital_lanka_app_db.sql)
            if (vehicleRepository.findById("WP LA-9999").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP LA-9999").plateNumber("WP LA-9999")
                        .owner(sugathadasa).model("Toyota Prius (Grey)").vehicleClass("B")
                        .fuelType("Petrol / Hybrid").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP CAD-1234").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP CAD-1234").plateNumber("WP CAD-1234")
                        .owner(sugathadasa).model("Honda Vezel (White)").vehicleClass("B")
                        .fuelType("Petrol / Hybrid").status("STOLEN")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP CBA-5678").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP CBA-5678").plateNumber("WP CBA-5678")
                        .owner(sugathadasa).model("Toyota Aqua (Blue)").vehicleClass("B")
                        .fuelType("Petrol / Hybrid").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP BC-5544").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP BC-5544").plateNumber("WP BC-5544")
                        .owner(ranaweera).model("Yamaha FZ (Black)").vehicleClass("A")
                        .fuelType("Petrol").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP KD-4321").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP KD-4321").plateNumber("WP KD-4321")
                        .owner(perera).model("Suzuki Wagon R (Red)").vehicleClass("B")
                        .fuelType("Petrol").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP ND-8877").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP ND-8877").plateNumber("WP ND-8877")
                        .owner(rathnayake).model("Isuzu Commercial Heavy Lorry (White)").vehicleClass("CE")
                        .fuelType("Diesel").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP NB-3322").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP NB-3322").plateNumber("WP NB-3322")
                        .owner(jayasuriya).model("Ashok Leyland Passenger Bus (Red)").vehicleClass("D")
                        .fuelType("Diesel").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }
            if (vehicleRepository.findById("WP PH-7711").isEmpty()) {
                vehicleRepository.save(Vehicle.builder()
                        .plateNo("WP PH-7711").plateNumber("WP PH-7711")
                        .owner(shenali).model("Nissan Leaf EV (Silver)").vehicleClass("B")
                        .fuelType("Electric").status("ACTIVE")
                        .insuranceStatus("VALID").revenueStatus("VALID").build());
            }

            // 4. Link & Seed all driving licenses from Digital_Lanka-dev (02_dmt_schema.sql)
            if (licenseRepository.findByDlNo("DL-1972045-Y").isEmpty()) {
                licenseRepository.save(License.builder()
                        .dlNo("DL-1972045-Y").driver(sugathadasa).validOperators("A1, A, B, G1").build());
            }
            if (licenseRepository.findByDlNo("DL-9044231-X").isEmpty()) {
                licenseRepository.save(License.builder()
                        .dlNo("DL-9044231-X").driver(ranaweera).validOperators("A, B").build());
            }
            if (licenseRepository.findByDlNo("DL-8822119-P").isEmpty()) {
                licenseRepository.save(License.builder()
                        .dlNo("DL-8822119-P").driver(perera).validOperators("B").build());
            }
            if (licenseRepository.findByDlNo("DL-7733441-H").isEmpty()) {
                licenseRepository.save(License.builder()
                        .dlNo("DL-7733441-H").driver(rathnayake).validOperators("C1, C, CE").build());
            }
            if (licenseRepository.findByDlNo("DL-6655443-B").isEmpty()) {
                licenseRepository.save(License.builder()
                        .dlNo("DL-6655443-B").driver(jayasuriya).validOperators("D1, D, PT").build());
            }
            if (licenseRepository.findByDlNo("DL-5544332-E").isEmpty()) {
                licenseRepository.save(License.builder()
                        .dlNo("DL-5544332-E").driver(shenali).validOperators("B").build());
            }
        };
    }
}
