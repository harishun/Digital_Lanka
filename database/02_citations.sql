-- ═══════════════════════════════════════════════════════════════════════════
--  Digital Lanka — citations table
--
--  The Citation entity existed in the codebase but no schema was ever defined,
--  and the application runs with spring.jpa.hibernate.ddl-auto=none, so nothing
--  created this table at startup. Penalty citations therefore could not be
--  persisted. This script adds the missing table.
--
--  Run against the digital_lanka_db schema:
--     mysql -u root -p digital_lanka_db < database/02_citations.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS citations (
    id                  BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    reference_number    VARCHAR(32)     NOT NULL UNIQUE,
    nic                 VARCHAR(12)     NOT NULL,               -- offender (driver)
    plate_number        VARCHAR(32)     DEFAULT NULL,
    violation_type      VARCHAR(512)    NOT NULL,
    gps_coordinates     VARCHAR(128)    DEFAULT NULL,
    fine_amount         VARCHAR(32)     DEFAULT NULL,
    officer_nic         VARCHAR(12)     DEFAULT NULL,           -- who issued it
    timestamp           DATETIME        NOT NULL,
    status              ENUM('PENDING_PAYMENT', 'VERIFYING', 'CLEARED')
                                        NOT NULL DEFAULT 'PENDING_PAYMENT',

    INDEX idx_citations_offender (nic),
    INDEX idx_citations_status   (status),
    INDEX idx_citations_officer  (officer_nic)
);

-- ── Optional: richer notification types ────────────────────────────────────
-- The enforcement flow currently files its alerts as 'GENERAL' so that it works
-- against the existing schema untouched. Run the statement below if you would
-- rather have citations and seizures show as distinct types in the inbox, then
-- change Notification.Type in EnforcementController to match.
--
-- ALTER TABLE notifications
--     MODIFY COLUMN type ENUM('INVITATION','STOLEN_ALERT','CITATION','SEIZURE','GENERAL')
--     NOT NULL DEFAULT 'INVITATION';
