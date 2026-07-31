-- ============================================================
-- Backend Application Database Schema
-- Database Name: trafficdb
-- Description: Manages application-level operational states,
--              users, roles, and registration requests.
-- ============================================================

CREATE DATABASE IF NOT EXISTS trafficdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE trafficdb;

-- ────────────────────────────────────────────────────────────
-- 1. TABLE: users
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `nic` VARCHAR(255) NOT NULL UNIQUE,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL UNIQUE,
    `password` VARCHAR(255) DEFAULT NULL,
    `role` VARCHAR(50) NOT NULL,
    `department` VARCHAR(255) DEFAULT NULL,
    `batch_number` VARCHAR(255) DEFAULT NULL,
    `rank` VARCHAR(255) DEFAULT NULL,
    `police_station` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting default values (with pre-hashed passwords using BCrypt)
INSERT INTO `users` (
    `nic`, 
    `full_name`, 
    `email`, 
    `password`, 
    `role`, 
    `department`, 
    `batch_number`, 
    `rank`, 
    `police_station`, 
    `created_at`
) VALUES 
-- Super Admin (Password: superadmin123)
('000000000V', 'System Super Admin', 'superadmin@traffic.gov.lk', '$2a$10$t7C3xDuHrv67vOUO4eJkJOfsh4y0t0Ac2emQYysReY/u0iNEAfMtG', 'SUPER_ADMIN', 'System Provisioning', NULL, NULL, NULL, NOW()),

-- Department Admin (Password: admin123)
('111111111V', 'Department Admin', 'admin@traffic.gov.lk', '$2a$10$C510pEsKHHOhrB9/z2YG7OUiUd/hD3k6gHos/UloB0vQpG6ytjYHa', 'ADMIN', 'Traffic Control HQ', NULL, NULL, NULL, NOW()),

-- Traffic Officer (Password: officer123)
('222222222V', 'Officer John Doe', 'officer@traffic.gov.lk', '$2a$10$1J3xmwQ80npSm3FKPzth4uzFwFUlenYGGrgiE9Fk2at6OZYvOFJQO', 'OFFICER', NULL, 'B-9988', 'Sergeant', 'Colombo Central', NOW()),

-- Normal User (Password: user123)
('333333333V', 'Normal User', 'user@traffic.gov.lk', '$2a$10$H3ZnH9QBmq/mLTYusqaccu7pZRPSzPH/YSVsHwawt4ewoBJkbjEem', 'USER', NULL, NULL, NULL, NULL, NOW())
ON DUPLICATE KEY UPDATE 
    `full_name` = VALUES(`full_name`),
    `password` = VALUES(`password`),
    `role` = VALUES(`role`),
    `department` = VALUES(`department`),
    `batch_number` = VALUES(`batch_number`),
    `rank` = VALUES(`rank`),
    `police_station` = VALUES(`police_station`);

-- ────────────────────────────────────────────────────────────
-- 2. TABLE: registration_requests
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `registration_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `nic` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `department` VARCHAR(255) DEFAULT NULL,
    `batch_number` VARCHAR(255) DEFAULT NULL,
    `rank` VARCHAR(255) DEFAULT NULL,
    `police_station` VARCHAR(255) DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
