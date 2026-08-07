-- ============================================================
--  DMT Mock Database Schema
--  Department of Motor Traffic — Sri Lanka
--  Based on Driving Licence Application Form MTA 30/2
-- ============================================================

CREATE DATABASE IF NOT EXISTS dmt_mock_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dmt_mock_db;

-- ────────────────────────────────────────────────────────────
-- 1. REFERENCE TABLE: vehicle_class_definitions
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_class_definitions (
    class_code  VARCHAR(5)      NOT NULL PRIMARY KEY,
    description VARCHAR(255)    NOT NULL,
    category    VARCHAR(60)     NOT NULL,
    min_age     TINYINT UNSIGNED NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vehicle_class_definitions (class_code, description, category, min_age) VALUES
('A1',  'Motorcycle Engine Capacity < 100cc', 'Motorcycle', 18),
('A',   'Motorcycle Engine Capacity > 100cc', 'Motorcycle', 18),
('B1',  'Motor Tricycle - Tare < 500kg, GVW > 1000kg', 'Light Vehicle', 18),
('B',   'All Cars/Dual Purpose - GVW < 3500kg, Passengers < 8, Trailer < 250kg', 'Light Vehicle', 18),
('C1',  'Light Motor Lorry - 3500kg < GVW < 17000kg, Trailer < 750kg', 'Heavy Vehicle', 21),
('C',   'Motor Lorry - GVW > 17000kg, Trailer < 750kg', 'Heavy Vehicle', 21),
('CE',  'Heavy Motor Lorry - GVW > 17000kg, Trailer > 750kg', 'Heavy Vehicle', 21),
('D1',  'Light Motor Coach - Passengers < 32, Trailer < 750kg', 'Passenger Transport', 21),
('D',   'Motor Coach - Passengers > 32, Trailer < 750kg', 'Passenger Transport', 21),
('DE',  'Heavy Motor Coach - Trailer > 750kg', 'Passenger Transport', 21),
('G1',  'Two Wheel Tractor with a Trailer', 'Agricultural', 18),
('G',   'Agricultural Land Vehicle with or without a Trailer', 'Agricultural', 18),
('J',   'Special Purpose Vehicle', 'Special', 21),
('PT',  'Public Transport Endorsement', 'Endorsement', 23)
ON DUPLICATE KEY UPDATE class_code=class_code;

-- ────────────────────────────────────────────────────────────
-- 2. FACT TABLE: driving_licences
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driving_licences (
    id                  CHAR(36)        NOT NULL PRIMARY KEY,
    licence_number      VARCHAR(20)     UNIQUE DEFAULT NULL,
    nic                 VARCHAR(15)     NOT NULL UNIQUE,
    surname             VARCHAR(150)    NOT NULL,
    other_names         VARCHAR(150)    DEFAULT NULL,
    full_name_on_card   VARCHAR(255)    NOT NULL,
    gender              ENUM('MALE', 'FEMALE') NOT NULL,
    date_of_birth       DATE            NOT NULL,
    blood_group         ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
    height_ft           TINYINT UNSIGNED DEFAULT NULL,
    height_inches       TINYINT UNSIGNED DEFAULT NULL,
    permanent_address   TEXT            NOT NULL,
    organ_donor         TINYINT(1)      NOT NULL DEFAULT 0,
    driver_restrictions ENUM('NONE', 'CORRECTIVE_LENSES', 'ARTIFICIAL_LIMB') NOT NULL DEFAULT 'NONE',
    photo_path          VARCHAR(500)    DEFAULT NULL,
    signature_path      VARCHAR(500)    DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO driving_licences (id, licence_number, nic, surname, other_names, full_name_on_card, gender, date_of_birth, blood_group, height_ft, height_inches, permanent_address, organ_donor, driver_restrictions)
VALUES
('d0000000-0000-0000-0000-000000000001', 'DL-1972045-Y', '197204509123', 'SUGATHADASA', 'W.M.', 'W.M. SUGATHADASA', 'MALE', '1972-06-15', 'B+', 5, 8, '45, Flower Road, Colombo 07', 1, 'NONE'),
('d0000000-0000-0000-0000-000000000002', 'DL-9044231-X', '198503402948', 'RANAWEERA', 'ARJUN', 'ARJUN RANAWEERA', 'MALE', '1985-03-04', 'A+', 5, 10, '45, Peradeniya Rd, Kandy', 1, 'NONE'),
('d0000000-0000-0000-0000-000000000003', 'DL-8822119-P', '199003402948', 'PERERA', 'K.A. DON', 'K.A. DON PERERA', 'MALE', '1990-11-20', 'B+', 5, 6, '12, Matara Rd, Galle', 0, 'NONE'),
('d0000000-0000-0000-0000-000000000004', 'DL-7733441-H', '198012304958', 'RATHNAYAKE', 'MAHINDA', 'MAHINDA RATHNAYAKE', 'MALE', '1980-04-12', 'O+', 6, 0, '88, Main Street, Kurunegala', 1, 'CORRECTIVE_LENSES'),
('d0000000-0000-0000-0000-000000000005', 'DL-6655443-B', '199556708123', 'JAYASURIYA', 'THARINDU', 'THARINDU JAYASURIYA', 'MALE', '1995-09-08', 'AB+', 5, 9, '23, Bus Stand Rd, Negombo', 1, 'NONE'),
('d0000000-0000-0000-0000-000000000006', 'DL-5544332-E', '200508901234', 'PERERA', 'SHENALI', 'SHENALI PERERA', 'FEMALE', '2005-02-14', 'A-', 5, 4, '101, Galle Road, Dehiwala', 1, 'NONE'),
('d0000000-0000-0000-0000-000000000007', 'DL-2222333-E', '199201509999', 'SILVA', 'KAMAL', 'KAMAL SILVA', 'MALE', '1992-01-15', 'O+', 5, 9, '7A, Marine Drive, Colombo', 1, 'NONE'),
('d0000000-0000-0000-0000-000000000008', 'DL-1111444-F', '198812301111', 'FERNANDO', 'NIMAL', 'NIMAL FERNANDO', 'MALE', '1988-12-30', 'A+', 5, 6, '99, Lake Road, Kandy', 0, 'NONE')
ON DUPLICATE KEY UPDATE nic=nic;

-- ────────────────────────────────────────────────────────────
-- 3. JUNCTION TABLE: licence_vehicle_classes
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licence_vehicle_classes (
    id              CHAR(36)        NOT NULL PRIMARY KEY,
    nic             VARCHAR(15)     NOT NULL,
    class_code      VARCHAR(5)      NOT NULL,
    issued_date     DATE            NOT NULL,
    expiry_date     DATE            NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nic) REFERENCES driving_licences(nic) ON DELETE CASCADE,
    FOREIGN KEY (class_code) REFERENCES vehicle_class_definitions(class_code),
    UNIQUE KEY uq_licence_class (nic, class_code)
);

INSERT INTO licence_vehicle_classes (id, nic, class_code, issued_date, expiry_date)
VALUES
('l0000000-0000-0000-0000-000000000001', '197204509123', 'A1', '1995-04-10', '2032-06-15'),
('l0000000-0000-0000-0000-000000000002', '197204509123', 'A', '1995-04-10', '2032-06-15'),
('l0000000-0000-0000-0000-000000000003', '197204509123', 'B', '1995-04-10', '2032-06-15'),
('l0000000-0000-0000-0000-000000000004', '197204509123', 'G1', '2000-01-15', '2032-06-15'),
('l0000000-0000-0000-0000-000000000005', '198503402948', 'B', '2003-11-15', '2029-11-15'),
('l0000000-0000-0000-0000-000000000006', '198503402948', 'A', '2003-11-15', '2029-11-15'),
('l0000000-0000-0000-0000-000000000007', '199003402948', 'B', '2008-06-01', '2030-06-01'),
('l0000000-0000-0000-0000-000000000008', '198012304958', 'C1', '2002-03-10', '2025-04-12'),
('l0000000-0000-0000-0000-000000000009', '198012304958', 'C', '2002-03-10', '2025-04-12'),
('l0000000-0000-0000-0000-000000000010', '198012304958', 'CE', '2005-08-20', '2025-04-12'),
('l0000000-0000-0000-0000-000000000011', '199556708123', 'D1', '2016-05-10', '2031-09-08'),
('l0000000-0000-0000-0000-000000000012', '199556708123', 'D', '2016-05-10', '2031-09-08'),
('l0000000-0000-0000-0000-000000000013', '199556708123', 'PT', '2018-01-20', '2031-09-08'),
('l0000000-0000-0000-0000-000000000014', '200508901234', 'B', '2023-03-01', '2033-02-14')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 4. TABLE: vehicle_registrations (VRC)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_registrations (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    plate_number    VARCHAR(20)     NOT NULL UNIQUE,
    doc_no          VARCHAR(50)     NOT NULL,
    issue_date      DATE            NOT NULL,
    expiry_date     VARCHAR(50)     NOT NULL DEFAULT 'Permanent',
    authority       VARCHAR(100)    NOT NULL,
    chassis_no      VARCHAR(50)     NOT NULL,
    engine_no       VARCHAR(50)     NOT NULL,
    fuel_type       VARCHAR(50)     NOT NULL,
    model           VARCHAR(100)    NOT NULL,
    color           VARCHAR(50)     NOT NULL,
    make_year       INT             NOT NULL,
    vehicle_class   VARCHAR(5)      NOT NULL,
    owner_nic       VARCHAR(15)     NOT NULL
);

INSERT INTO vehicle_registrations (id, plate_number, doc_no, issue_date, expiry_date, authority, chassis_no, engine_no, fuel_type, model, color, make_year, vehicle_class, owner_nic)
VALUES
('v1', 'WP LA-9999', 'VRC-WPLA9999-88A', '2021-08-15', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-782637218-X', 'ENG-1NZ-991827', 'Petrol / Hybrid', 'Toyota Prius', 'Grey', 2018, 'B', '197204509123'),
('v2', 'WP CAD-1234', 'VRC-WPCAD1234-99B', '2022-09-20', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-998822110-B', 'ENG-L15B-228193', 'Petrol / Hybrid', 'Honda Vezel', 'White', 2019, 'B', '197204509123'),
('v3', 'WP BC-5544', 'VRC-WPBC5544-22X', '2023-05-10', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-112233445-Z', 'ENG-21C-558291', 'Petrol', 'Yamaha FZ', 'Black', 2021, 'A', '198503402948'),
('v4', 'WP CBA-5678', 'VRC-WPCBA5678-77F', '2023-04-12', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-334455667-A', 'ENG-1LM-445522', 'Petrol / Hybrid', 'Toyota Aqua', 'Blue', 2017, 'B', '197204509123'),
('v5', 'WP KD-4321', 'VRC-WPKD4321-44G', '2024-02-18', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-556677889-C', 'ENG-R06A-882291', 'Petrol', 'Suzuki Wagon R', 'Red', 2020, 'B', '199003402948'),
('v6', 'WP ND-8877', 'VRC-WPND8877-11M', '2019-01-10', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-ISZ-991827-H', 'ENG-4HK1-5544', 'Diesel', 'Isuzu Commercial Heavy Lorry', 'White', 2015, 'CE', '198012304958'),
('v7', 'WP NB-3322', 'VRC-WPNB3322-55P', '2020-06-14', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-LEY-883920-K', 'ENG-6D16-9922', 'Diesel', 'Ashok Leyland Passenger Bus', 'Red', 2018, 'D', '199556708123'),
('v8', 'WP PH-7711', 'VRC-WPPH7711-99E', '2023-11-05', 'Permanent / Non-Expiring', 'Department of Motor Traffic (DMT) Sri Lanka', 'CHA-NIS-772211-E', 'ENG-EM57-EV01', 'Electric', 'Nissan Leaf EV', 'Silver', 2022, 'B', '200508901234')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 5. TABLE: revenue_licenses
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_licenses (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id      VARCHAR(36)     NOT NULL UNIQUE,
    license_no      VARCHAR(50)     NOT NULL,
    issue_date      DATE            NOT NULL,
    expiry_date     DATE            NOT NULL,
    authority       VARCHAR(100)    NOT NULL,
    status          VARCHAR(50)     NOT NULL,
    fee             VARCHAR(50)     NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle_registrations(id) ON DELETE CASCADE
);

INSERT INTO revenue_licenses (id, vehicle_id, license_no, issue_date, expiry_date, authority, status, fee)
VALUES
('rl1', 'v1', 'RL-99281736-Z', '2025-12-15', '2026-12-15', 'Western Province DMT', 'ACTIVE / PAID', 'LKR 4,250.00'),
('rl2', 'v2', 'RL-88273615-Y', '2025-09-20', '2026-09-20', 'Western Province DMT', 'ACTIVE / PAID', 'LKR 4,500.00'),
('rl3', 'v3', 'RL-77382612-X', '2025-05-10', '2026-05-10', 'Southern Province DMT', 'ACTIVE / PAID', 'LKR 1,500.00'),
('rl4', 'v4', 'RL-77665544-Y', '2025-04-12', '2026-04-12', 'Western Province DMT', 'ACTIVE / PAID', 'LKR 4,100.00'),
('rl5', 'v5', 'RL-55443322-Z', '2025-02-18', '2026-02-18', 'Western Province DMT', 'ACTIVE / PAID', 'LKR 3,800.00'),
('rl6', 'v6', 'RL-22110099-E', '2024-03-10', '2025-03-10', 'North Western Province DMT', 'EXPIRED / RENEWAL DUE', 'LKR 18,500.00'),
('rl7', 'v7', 'RL-33445566-P', '2025-07-01', '2026-07-01', 'Western Province DMT', 'ACTIVE / PAID', 'LKR 22,000.00'),
('rl8', 'v8', 'RL-99887766-E', '2025-11-05', '2026-11-05', 'Western Province DMT', 'ACTIVE / EXEMPTION DISCOUNT', 'LKR 2,500.00')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 6. TABLE: insurance_policies
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_policies (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id      VARCHAR(36)     NOT NULL UNIQUE,
    policy_no       VARCHAR(50)     NOT NULL,
    underwriter     VARCHAR(100)    NOT NULL,
    policy_type     VARCHAR(50)     NOT NULL,
    issue_date      DATE            NOT NULL,
    expiry_date     DATE            NOT NULL,
    premium         VARCHAR(50)     NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle_registrations(id) ON DELETE CASCADE
);

INSERT INTO insurance_policies (id, vehicle_id, policy_no, underwriter, policy_type, issue_date, expiry_date, premium)
VALUES
('ins1', 'v1', 'INS-PR-99281-01', 'Sri Lanka Insurance Corporation (SLIC)', 'Comprehensive (Full Collision)', '2026-01-10', '2027-01-10', 'LKR 65,000.00'),
('ins2', 'v2', 'INS-HON-11223-05', 'Allianz Insurance Lanka Ltd', 'Comprehensive (Collision + 3rd Party)', '2025-09-18', '2026-09-18', 'LKR 72,000.00'),
('ins3', 'v3', 'INS-MOT-55331-09', 'Ceylinco General Insurance Ltd', 'Third Party Only', '2025-05-08', '2026-05-08', 'LKR 5,500.00'),
('ins4', 'v4', 'INS-AQ-33445-02', 'HNB General Insurance Ltd', 'Comprehensive', '2026-04-01', '2027-04-01', 'LKR 58,000.00'),
('ins5', 'v5', 'INS-WAG-55667-03', 'People\'s Insurance PLC', 'Comprehensive', '2025-02-15', '2026-02-15', 'LKR 49,000.00'),
('ins6', 'v6', 'INS-LOR-99887-11', 'Cooperative Insurance Company', 'Commercial Third Party Heavy', '2024-03-01', '2025-03-01', 'LKR 35,000.00'),
('ins7', 'v7', 'INS-BUS-44556-22', 'Sri Lanka Insurance Corporation (SLIC)', 'Public Passenger Cover', '2025-06-15', '2026-06-15', 'LKR 95,000.00'),
('ins8', 'v8', 'INS-EV-112233-99', 'Fairfirst Insurance Ltd', 'Comprehensive EV Special', '2025-11-01', '2026-11-01', 'LKR 62,000.00')
ON DUPLICATE KEY UPDATE id=id;

-- ────────────────────────────────────────────────────────────
-- 7. TABLE: emission_certificates
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emission_certificates (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    vehicle_id      VARCHAR(36)     NOT NULL UNIQUE,
    test_no         VARCHAR(50)     NOT NULL,
    issue_date      DATE            NOT NULL,
    expiry_date     DATE            NOT NULL,
    testing_center  VARCHAR(100)    NOT NULL,
    result          VARCHAR(50)     NOT NULL,
    co_value        VARCHAR(50)     NOT NULL,
    hc_value        VARCHAR(50)     NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle_registrations(id) ON DELETE CASCADE
);

INSERT INTO emission_certificates (id, vehicle_id, test_no, issue_date, expiry_date, testing_center, result, co_value, hc_value)
VALUES
('em1', 'v1', 'EM-2026-7781A', '2025-12-10', '2026-12-10', 'Laugfs Eco Sri (Pvt) Ltd - Colombo 03', 'PASSED / COMPLIANT', '0.22% (Limit: 3.0%)', '88 ppm (Limit: 600 ppm)'),
('em2', 'v2', 'EM-2025-3392Z', '2025-09-10', '2026-09-10', 'CleanCo Lanka (Pvt) Ltd (DriveGreen)', 'PASSED / COMPLIANT', '0.15% (Limit: 3.0%)', '62 ppm (Limit: 600 ppm)'),
('em3', 'v3', 'EM-2025-1102B', '2025-05-05', '2026-05-05', 'CleanCo Lanka (Pvt) Ltd (DriveGreen)', 'PASSED / COMPLIANT', '1.10% (Limit: 4.5%)', '150 ppm (Limit: 9000 ppm)'),
('em4', 'v4', 'EM-2026-4455X', '2026-03-25', '2027-03-25', 'Laugfs Eco Sri (Pvt) Ltd', 'PASSED / COMPLIANT', '0.18% (Limit: 3.0%)', '70 ppm (Limit: 600 ppm)'),
('em5', 'v5', 'EM-2025-8811Y', '2025-02-10', '2026-02-10', 'CleanCo Lanka (Pvt) Ltd (DriveGreen)', 'PASSED / COMPLIANT', '0.25% (Limit: 3.0%)', '95 ppm (Limit: 600 ppm)'),
('em6', 'v6', 'EM-2024-9911D', '2024-02-15', '2025-02-15', 'CleanCo Lanka (Pvt) Ltd (DriveGreen)', 'EXPIRED / RE-TEST REQUIRED', '3.90% (Limit: 4.5%)', '420 ppm (Limit: 600 ppm)'),
('em7', 'v7', 'EM-2025-5566B', '2025-06-10', '2026-06-10', 'Laugfs Eco Sri (Pvt) Ltd', 'PASSED / NEAR LIMIT', '3.80% (Limit: 4.5%)', '510 ppm (Limit: 600 ppm)'),
('em8', 'v8', 'EM-EV-EXEMPT', '2025-11-01', '2028-11-01', 'National Transport Medical & Emission Board', 'EXEMPT (ZERO EMISSION EV)', '0.00% (Zero Emission)', '0 ppm (Zero Emission)')
ON DUPLICATE KEY UPDATE id=id;
