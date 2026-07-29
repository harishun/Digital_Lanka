package com.digitallanka.backend.model;

/**
 * Vehicle — DEPRECATED as a JPA entity.
 *
 * Vehicles are now sourced exclusively from the DMT Mock Government API
 * (vehicle_registrations table in dmt_mock_db). This class is kept as a
 * placeholder to avoid import errors in any residual references, but it is
 * no longer an @Entity and the local 'vehicles' table is no longer managed
 * by this application.
 *
 * Use VehicleRegistrationResponse DTO for all vehicle data operations.
 */
public class Vehicle {

    // Kept for backward-compatibility only — not persisted
    public enum Status {
        ACTIVE,
        STOLEN,
        PENDING_VERIFICATION
    }
}
