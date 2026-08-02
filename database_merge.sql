-- =============================================================================
-- DIGITAL LANKA - UNIFIED DATABASE MERGE & MIGRATION SCRIPT
-- =============================================================================
-- This script creates the unified `digital_lanka_db` database schema and
-- merges identity records (DRP) with vehicle/license records (DMT).
--
-- How to use:
-- 1. Run this script in your MySQL client (MySQL Workbench, phpMyAdmin, CLI).
-- 2. Spring Boot will automatically link to these tables when started.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS digital_lanka_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE digital_lanka_db;

-- -----------------------------------------------------------------------------
-- 1. CITIZENS TABLE (Merged DRP Identity Registry & Authentication Profiles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizens (
    nic VARCHAR(15) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    blood_group VARCHAR(5) NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CITIZEN',
    password VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(10) DEFAULT 'Male',
    address TEXT NULL,
    place_of_birth VARCHAR(100) NULL,
    donor BOOLEAN DEFAULT TRUE,
    vehicle_classes JSON NULL,
    PRIMARY KEY (nic),
    INDEX idx_citizen_role (role)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. LICENSES TABLE (DMT Driver License Registry linked to Citizen NIC)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS licenses (
    dl_no VARCHAR(20) NOT NULL,
    nic VARCHAR(15) NOT NULL,
    valid_operators VARCHAR(100) NOT NULL DEFAULT 'B',
    date_of_issue DATE NULL,
    date_of_expiry DATE NULL,
    PRIMARY KEY (dl_no),
    UNIQUE KEY uk_driver_nic (nic),
    CONSTRAINT fk_license_citizen 
        FOREIGN KEY (nic) REFERENCES citizens(nic) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. VEHICLES TABLE (DMT Vehicle Registry, Insurance, Tax & Stolen Status)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    plate_no VARCHAR(20) NOT NULL,
    plate_number VARCHAR(20) NULL,
    owner_nic VARCHAR(15) NOT NULL,
    model VARCHAR(100) DEFAULT 'Toyota Prius (Grey)',
    vehicle_class VARCHAR(10) DEFAULT 'B',
    fuel_type VARCHAR(30) DEFAULT 'Petrol / Hybrid',
    insurance_status VARCHAR(20) DEFAULT 'VALID',
    revenue_status VARCHAR(20) DEFAULT 'VALID',
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE or STOLEN
    PRIMARY KEY (plate_no),
    INDEX idx_vehicle_owner (owner_nic),
    INDEX idx_vehicle_status (status),
    CONSTRAINT fk_vehicle_owner 
        FOREIGN KEY (owner_nic) REFERENCES citizens(nic) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. CITATIONS TABLE (Roadside Enforcement Tickets & Violation Records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citations (
    id BIGINT AUTO_INCREMENT NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    offender_nic VARCHAR(15) NOT NULL,
    violation_type VARCHAR(200) NOT NULL,
    gps_coordinates VARCHAR(100) NULL,
    timestamp DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    PRIMARY KEY (id),
    UNIQUE KEY uk_reference_number (reference_number),
    INDEX idx_offender_nic (offender_nic),
    CONSTRAINT fk_citation_offender 
        FOREIGN KEY (offender_nic) REFERENCES citizens(nic) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 5. OPTIONAL: IMPORT FROM SEPARATE EXISTING MOCK DATABASES
-- =============================================================================
-- If your team has existing data inside separate MySQL databases (`drp_mock_db`
-- and `dmt_mock_db`), uncomment and run the following queries to import them:

-- INSERT IGNORE INTO digital_lanka_db.citizens (nic, full_name, date_of_birth, gender, address, place_of_birth, blood_group, donor)
-- SELECT nic, full_name, date_of_birth, gender, address, place_of_birth, blood_group, donor
-- FROM drp_mock_db.citizens;

-- INSERT IGNORE INTO digital_lanka_db.licenses (dl_no, nic, valid_operators)
-- SELECT dl_no, nic, valid_operators
-- FROM dmt_mock_db.driving_licenses;

-- INSERT IGNORE INTO digital_lanka_db.vehicles (plate_no, owner_nic, model, vehicle_class, fuel_type, status)
-- SELECT plate_number, owner_nic, CONCAT(make, ' ', model), vehicle_class, fuel_type, status
-- FROM dmt_mock_db.vehicle_registrations;

-- =============================================================================
-- 6. VERIFICATION QUERY (Test that citizens, licenses, and vehicles are merged)
-- =============================================================================
-- SELECT 
--     c.nic,
--     c.full_name,
--     l.dl_no,
--     l.valid_operators,
--     v.plate_no,
--     v.model,
--     v.status AS vehicle_status
-- FROM citizens c
-- LEFT JOIN licenses l ON c.nic = l.nic
-- LEFT JOIN vehicles v ON c.nic = v.owner_nic;
