-- ============================================================
--  DRP Mock Database Schema
--  Department of Registration of Persons — Sri Lanka
--  Based on Identity Card Application Form "B"
--  (Registration of Persons Act, No. 32 of 1968)
-- ============================================================

CREATE DATABASE IF NOT EXISTS drp_mock_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE drp_mock_db;

CREATE TABLE IF NOT EXISTS citizens (
    -- Surrogate primary key (UUID) — stable regardless of NIC status
    id                  CHAR(36)        NOT NULL PRIMARY KEY,

    -- NIC is nullable: a record can exist before the card is formally issued
    nic                 VARCHAR(12)     UNIQUE,

    -- Office-assigned internal registry number
    ic_number           VARCHAR(20)     UNIQUE,

    -- Name fields — English only (block letters as per Cage 2 of form)
    full_name           VARCHAR(255)    NOT NULL,
    -- Cage 3: name to print on card if different from full_name
    name_on_card        VARCHAR(255)    DEFAULT NULL,

    -- Personal details
    gender              ENUM('MALE', 'FEMALE') NOT NULL,
    date_of_birth       DATE            NOT NULL,
    place_of_birth      VARCHAR(150)    DEFAULT NULL,
    district_of_birth   VARCHAR(100)    DEFAULT NULL,

    -- Permanent address (Field 8.1 of form)
    address_house       VARCHAR(150)    DEFAULT NULL,   -- House name or number
    address_road        VARCHAR(150)    DEFAULT NULL,   -- Road / Street / Lane
    address_city        VARCHAR(100)    DEFAULT NULL,   -- Village / City
    address_postal_code VARCHAR(10)     DEFAULT NULL,

    -- Card issuance — nullable if card is still being processed
    issued_date         DATE            DEFAULT NULL,

    -- File paths for binary assets stored on disk (not in DB)
    photo_path          VARCHAR(500)    DEFAULT NULL,
    signature_path      VARCHAR(500)    DEFAULT NULL,

    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed citizens
INSERT INTO citizens (id, nic, ic_number, full_name, name_on_card, gender, date_of_birth, place_of_birth, district_of_birth, address_house, address_road, address_city, address_postal_code, issued_date)
VALUES
('c0000000-0000-0000-0000-000000000001', '197204509123', 'IC-197204509', 'W.M. SUGATHADASA', 'W.M. Sugathadasa', 'MALE', '1972-06-15', 'Colombo', 'Colombo', '45', 'Flower Road', 'Colombo', '00700', '1995-04-10'),
('c0000000-0000-0000-0000-000000000002', '198503402948', 'IC-198503402', 'ARJUN RANAWEERA', 'A. Ranaweera', 'MALE', '1985-03-04', 'Kandy', 'Kandy', '45', 'Peradeniya Rd', 'Kandy', '20000', '2003-10-12'),
('c0000000-0000-0000-0000-000000000003', '199003402948', 'IC-199003402', 'K.A. DON PERERA', 'K.A.D. Perera', 'MALE', '1990-11-20', 'Galle', 'Galle', '12', 'Matara Rd', 'Galle', '80000', '2008-05-24'),
('c0000000-0000-0000-0000-000000000004', '198012304958', 'IC-198012304', 'MAHINDA RATHNAYAKE', 'M. Rathnayake', 'MALE', '1980-04-12', 'Kurunegala', 'Kurunegala', '88', 'Main Street', 'Kurunegala', '60000', '1998-05-15'),
('c0000000-0000-0000-0000-000000000005', '199556708123', 'IC-199556708', 'THARINDU JAYASURIYA', 'T. Jayasuriya', 'MALE', '1995-09-08', 'Negombo', 'Gampaha', '23', 'Bus Stand Rd', 'Negombo', '11500', '2013-09-20'),
('c0000000-0000-0000-0000-000000000006', '200508901234', 'IC-200508901', 'SHENALI PERERA', 'S. Perera', 'FEMALE', '2005-02-14', 'Dehiwala', 'Colombo', '101', 'Galle Road', 'Dehiwala', '10350', '2021-03-10'),
('c0000000-0000-0000-0000-000000000007', '199201509999', 'IC-199201509', 'KAMAL SILVA', 'K. Silva', 'MALE', '1992-01-15', 'Colombo', 'Colombo', '7A', 'Marine Drive', 'Colombo', '00300', '2010-02-14'),
('c0000000-0000-0000-0000-000000000008', '198812301111', 'IC-198812301', 'NIMAL FERNANDO', 'N. Fernando', 'MALE', '1988-12-30', 'Kandy', 'Kandy', '99', 'Lake Road', 'Kandy', '20000', '2006-11-20'),
('c0000000-0000-0000-0000-000000000009', '197828430012', 'IC-197828430', 'O.F. JAYASURIYA', 'O. Jayasuriya', 'MALE', '1978-08-24', 'Colombo', 'Colombo', '10', 'Police Headquarters', 'Colombo', '00100', '1996-01-01')
ON DUPLICATE KEY UPDATE nic=nic;
