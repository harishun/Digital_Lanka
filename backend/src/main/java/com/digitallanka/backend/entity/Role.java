package com.digitallanka.backend.entity;

/**
 * Role — persisted as a string on the {@code citizens} table.
 *
 * <p>Three logical roles exist: CITIZEN, OFFICER and ADMIN. Historically each one
 * acquired a second spelling as the modules were merged ({@code CITIZEN} vs
 * {@code ROLE_CITIZEN}, {@code POLICE_OFFICER} vs {@code ROLE_OFFICER},
 * {@code ROOT_ADMIN} vs {@code ROLE_ADMIN}), which forced every authorization
 * check to enumerate all six values.
 *
 * <p>The legacy spellings are retained so existing database rows still
 * deserialize, but they are deprecated: new code must use the canonical
 * {@code ROLE_*} constants, and every authority/permission check must go through
 * {@link #toAuthority()} rather than comparing enum constants directly.
 */
public enum Role {

    // ── Canonical ────────────────────────────────────────────────────────────
    ROLE_CITIZEN,
    ROLE_OFFICER,
    ROLE_ADMIN,

    // ── Legacy aliases (kept for DB compatibility — do not use in new code) ──
    /** @deprecated use {@link #ROLE_CITIZEN} */
    @Deprecated CITIZEN,
    /** @deprecated use {@link #ROLE_OFFICER} */
    @Deprecated POLICE_OFFICER,
    /** @deprecated use {@link #ROLE_ADMIN} */
    @Deprecated ROOT_ADMIN;

    /**
     * The single canonical Spring Security authority for this role. Use this
     * everywhere instead of comparing enum constants, so the legacy aliases
     * never have to be enumerated again.
     */
    public String toAuthority() {
        switch (this) {
            case ROLE_OFFICER:
            case POLICE_OFFICER:
                return "ROLE_OFFICER";
            case ROLE_ADMIN:
            case ROOT_ADMIN:
                return "ROLE_ADMIN";
            default:
                return "ROLE_CITIZEN";
        }
    }

    /** True if this role may perform law-enforcement actions. */
    public boolean isLawEnforcement() {
        String authority = toAuthority();
        return "ROLE_OFFICER".equals(authority) || "ROLE_ADMIN".equals(authority);
    }
}
