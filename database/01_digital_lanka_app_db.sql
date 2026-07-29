-- ============================================================
-- Digital Lanka Application Database Schema
-- Database Name: digital_lanka_db
-- Description: Manages application-level operational states,
--              citizens, vehicles, authorizations, stolen flags & notifications.
-- ============================================================

CREATE DATABASE IF NOT EXISTS digital_lanka_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE digital_lanka_db;

-- ────────────────────────────────────────────────────────────
-- 1. TABLE: citizens
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizens (
    nic                 VARCHAR(15)     NOT NULL PRIMARY KEY,
    full_name           VARCHAR(255)    NOT NULL,
    date_of_birth       DATE            NOT NULL,
    gender              VARCHAR(10)     NOT NULL DEFAULT 'Male',
    address             TEXT            NOT NULL,
    place_of_birth      VARCHAR(255)    NOT NULL DEFAULT 'Colombo General Hospital',
    blood_group         VARCHAR(5)      NOT NULL DEFAULT 'O+',
    donor               TINYINT(1)      NOT NULL DEFAULT 1,
    vehicle_classes     TEXT            NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO citizens (nic, full_name, date_of_birth, gender, address, place_of_birth, blood_group, donor, vehicle_classes)
VALUES
('197204509123', 'W.M. SUGATHADASA', '1972-06-15', 'Male', '45, Flower Road, Colombo 07', 'Colombo General Hospital', 'B+', 1, '[{"classCode":"A1","description":"Light Motorcycle","issuedDate":"1995-04-10","expiryDate":"2032-06-15"},{"classCode":"A","description":"Motorcycle","issuedDate":"1995-04-10","expiryDate":"2032-06-15"},{"classCode":"B","description":"Passenger Car","issuedDate":"1995-04-10","expiryDate":"2032-06-15"}]'),
('198503402948', 'ARJUN RANAWEERA', '1985-03-04', 'Male', '45, Peradeniya Rd, Kandy', 'Kandy General Hospital', 'A+', 1, '[{"classCode":"A","description":"Motorcycle","issuedDate":"2003-11-15","expiryDate":"2029-11-15"},{"classCode":"B","description":"Passenger Car","issuedDate":"2003-11-15","expiryDate":"2029-11-15"}]'),
('199003402948', 'K.A. DON PERERA', '1990-11-20', 'Male', '12, Matara Rd, Galle', 'Galle General Hospital', 'B+', 0, '[{"classCode":"B","description":"Passenger Car","issuedDate":"2008-06-01","expiryDate":"2030-06-01"}]')
ON DUPLICATE KEY UPDATE nic=nic;

-- ────────────────────────────────────────────────────────────
-- 2. TABLE: vehicles
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
    id                  VARCHAR(20)     NOT NULL PRIMARY KEY,
    plate_number        VARCHAR(20)     NOT NULL UNIQUE,
    owner_nic           VARCHAR(15)     NOT NULL,
    model               VARCHAR(100)    NOT NULL,
    vehicle_class       VARCHAR(5)      NOT NULL DEFAULT 'B',
    fuel_type           VARCHAR(50)     NOT NULL DEFAULT 'Petrol / Hybrid',
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_nic) REFERENCES citizens(nic) ON DELETE CASCADE
);

INSERT INTO vehicles (id, plate_number, owner_nic, model, vehicle_class, fuel_type, status)
VALUES
('WP LA-9999', 'WP LA-9999', '197204509123', 'Toyota Prius (Grey)', 'B', 'Petrol / Hybrid', 'ACTIVE'),
('WP CAD-1234', 'WP CAD-1234', '197204509123', 'Honda Vezel (White)', 'B', 'Petrol / Hybrid', 'ACTIVE'),
('WP CBA-5678', 'WP CBA-5678', '197204509123', 'Toyota Aqua (Blue)', 'B', 'Petrol / Hybrid', 'ACTIVE'),
('WP BC-5544', 'WP BC-5544', '198503402948', 'Yamaha FZ (Black)', 'A', 'Petrol', 'ACTIVE'),
('WP KD-4321', 'WP KD-4321', '199003402948', 'Suzuki Wagon R (Red)', 'B', 'Petrol', 'ACTIVE')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 3. TABLE: vehicle_authorizations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_authorizations (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id          VARCHAR(20)     NOT NULL,
    owner_nic           VARCHAR(15)     NOT NULL,
    authorized_nic      VARCHAR(15)     NOT NULL,
    access_type         VARCHAR(20)     NOT NULL DEFAULT 'PERMANENT',
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    start_time          DATETIME        NULL,
    end_time            DATETIME        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_nic) REFERENCES citizens(nic) ON DELETE CASCADE,
    FOREIGN KEY (authorized_nic) REFERENCES citizens(nic) ON DELETE CASCADE
);

INSERT INTO vehicle_authorizations (id, vehicle_id, owner_nic, authorized_nic, access_type, status)
VALUES
('auth_101', 'WP LA-9999', '197204509123', '198503402948', 'PERMANENT', 'GRANTED')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 4. TABLE: notifications
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    recipient_nic       VARCHAR(15)     NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    message             TEXT            NOT NULL,
    type                VARCHAR(50)     NOT NULL DEFAULT 'INVITATION',
    reference_id        VARCHAR(100)    DEFAULT NULL,
    is_read             TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_nic) REFERENCES citizens(nic) ON DELETE CASCADE
);

INSERT INTO notifications (id, recipient_nic, title, message, type, reference_id, is_read)
VALUES
('notif_001', '198503402948', 'New Driving Access Invitation', 'W.M. SUGATHADASA has invited you to drive vehicle WP LA-9999 (PERMANENT Access).', 'INVITATION', 'auth_101', 0)
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 5. TABLE: stolen_recovery_logs
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stolen_recovery_logs (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id          VARCHAR(20)     NOT NULL,
    action              VARCHAR(20)     NOT NULL,
    officer_nic         VARCHAR(15)     NOT NULL,
    remarks             TEXT            DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
