-- ============================================================
-- Digital Lanka Application Database Schema
-- Database Name: digital_lanka_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS digital_lanka_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE digital_lanka_db;

-- ────────────────────────────────────────────────────────────
-- 1. TABLE: users
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    nic                 VARCHAR(12)     NOT NULL PRIMARY KEY,
    password            VARCHAR(255)    NOT NULL,
    email               VARCHAR(255)    UNIQUE,
    phone               VARCHAR(255),
    role                ENUM('ROLE_CITIZEN', 'ROLE_OFFICER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN') NOT NULL,
    active              TINYINT(1)      NOT NULL DEFAULT 1,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (nic, password, email, phone, role) VALUES
('197204509123', '$2a$10$0F2x19Eao99orgUocZlfF.lRG7zb6WLSgv2t5NcEyb9wPylV1/oWq', 'sugathadasa@gmail.com', '0777654321', 'ROLE_SUPER_ADMIN'),
('198503402948', '$2a$10$SCqif5ovxtZ3ssMwKIZYcuSh5kzca59P1phDdskcyfZv6TjGgY3wO', 'arjun@gmail.com', '0772345678', 'ROLE_CITIZEN'),
('199003402948', '$2a$10$p/fbhscLyZX5J5wo/uuTuuRE2YXKcjZVCF5MC4xaDOvgKzZtXzNhm', 'perera@gmail.com', '0773456789', 'ROLE_CITIZEN'),
('198012304958', '$2a$10$ehj1ZDhM9UZaQZt1QMWkbuhfv2aX8F68GC3RIcEbLlB2t6O2K/46C', 'mahinda@gmail.com', '0774567890', 'ROLE_CITIZEN'),
('199556708123', '$2a$10$oXJFjtToar7E5yLUfd9.FODTeb82bk7oD4OXNBfO088zZp6sT2/9G', 'tharindu@gmail.com', '0775678901', 'ROLE_CITIZEN'),
('200508901234', '$2a$10$N5daL3JUBVwqdQ9vg9ybTeNdtAyDy.lMSIseD9QhQxFFb6G/u/fIe', 'shenali@gmail.com', '0776789012', 'ROLE_CITIZEN')
ON DUPLICATE KEY UPDATE nic=nic;

-- ────────────────────────────────────────────────────────────
-- 2. TABLE: vehicle_assets
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_assets (
    id                  BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    owner_nic           VARCHAR(255)    NOT NULL,
    status              ENUM('PENDING_VERIFICATION', 'ACTIVE', 'REJECTED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    custom_name         VARCHAR(255)    NOT NULL,
    make                VARCHAR(255)    NOT NULL,
    model               VARCHAR(255)    NOT NULL,
    chassis_number      VARCHAR(255)    NOT NULL UNIQUE,
    plate_number        VARCHAR(255)    NOT NULL UNIQUE,
    color               VARCHAR(255)    NOT NULL
);

INSERT INTO vehicle_assets (id, owner_nic, status, custom_name, make, model, chassis_number, plate_number, color) VALUES
(1, '197204509123', 'ACTIVE', 'My Prius', 'Toyota', 'Prius', 'CHA-782637218-X', 'WP LA-9999', 'Grey'),
(2, '197204509123', 'ACTIVE', 'My Vezel', 'Honda', 'Vezel', 'CHA-998822110-B', 'WP CAD-1234', 'White'),
(3, '198503402948', 'ACTIVE', 'My FZ', 'Yamaha', 'FZ', 'CHA-112233445-Z', 'WP BC-5544', 'Black'),
(4, '197204509123', 'ACTIVE', 'My Aqua', 'Toyota', 'Aqua', 'CHA-334455667-A', 'WP CBA-5678', 'Blue'),
(5, '199003402948', 'ACTIVE', 'My Wagon R', 'Suzuki', 'Wagon R', 'CHA-556677889-C', 'WP KD-4321', 'Red'),
(6, '198012304958', 'ACTIVE', 'My Lorry', 'Isuzu', 'Commercial Heavy Lorry', 'CHA-ISZ-991827-H', 'WP ND-8877', 'White'),
(7, '199556708123', 'ACTIVE', 'My Bus', 'Ashok Leyland', 'Passenger Bus', 'CHA-LEY-883920-K', 'WP NB-3322', 'Red'),
(8, '200508901234', 'ACTIVE', 'My Leaf', 'Nissan', 'Leaf EV', 'CHA-NIS-772211-E', 'WP PH-7711', 'Silver')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 3. TABLE: vehicle_authorizations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_authorizations (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id          VARCHAR(36)     NOT NULL,
    owner_nic           VARCHAR(12)     NOT NULL,
    authorized_nic      VARCHAR(12)     NOT NULL,
    access_type         ENUM('PERMANENT', 'TIME_BOUND') NOT NULL DEFAULT 'PERMANENT',
    status              ENUM('PENDING', 'GRANTED', 'DECLINED', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    start_time          DATETIME        NULL,
    end_time            DATETIME        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO vehicle_authorizations (id, vehicle_id, owner_nic, authorized_nic, access_type, status) VALUES
('auth_101', '1', '197204509123', '198503402948', 'PERMANENT', 'GRANTED'),
('auth_102', '1', '197204509123', '199003402948', 'TIME_BOUND', 'PENDING'),
('auth_103', '3', '198503402948', '197204509123', 'PERMANENT', 'GRANTED')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 4. TABLE: notifications
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    recipient_nic       VARCHAR(12)     NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    message             TEXT            NOT NULL,
    type                ENUM('INVITATION', 'STOLEN_ALERT', 'GENERAL') NOT NULL DEFAULT 'INVITATION',
    reference_id        VARCHAR(36)     DEFAULT NULL,
    is_read             TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notifications (id, recipient_nic, title, message, type, reference_id, is_read) VALUES
('notif_001', '198503402948', 'Driving Access Granted', 'W.M. SUGATHADASA has authorized PERMANENT access to drive vehicle WP LA-9999.', 'GENERAL', 'auth_101', 0),
('notif_002', '199003402948', 'New Driving Access Invitation', 'W.M. SUGATHADASA invited you to drive vehicle WP LA-9999 (TIME_BOUND Access).', 'INVITATION', 'auth_102', 0)
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 5. TABLE: theft_cases
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theft_cases (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id          VARCHAR(36)     NOT NULL,
    reporter_nic        VARCHAR(12)     NOT NULL,
    reported_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at         DATETIME        DEFAULT NULL,
    resolving_officer_nic VARCHAR(12)   DEFAULT NULL,
    remarks             TEXT            DEFAULT NULL,
    status              ENUM('PENDING', 'RESOLVED') NOT NULL DEFAULT 'PENDING'
);

INSERT INTO theft_cases (id, vehicle_id, reporter_nic, remarks, status) VALUES
('case_001', '2', '197204509123', 'Vehicle reported missing by owner W.M. Sugathadasa.', 'PENDING')
ON DUPLICATE KEY UPDATE id=id;
