# Digital Lanka — Database Setup & Sharing Guide for Developers

This guide provides instructions for developers to run and share the **Digital Lanka Application Database** (`digital_lanka_db`) and the **DMT Statutory Mock Registry Database** (`dmt_mock_db`).

---

## 🚀 Option 1: Docker Compose (Recommended - 1 Command Setup)

If you have **Docker Desktop** installed, run the following command in the root project directory:

```bash
docker compose up -d
```

### What Docker Does:
1. Starts **MySQL 8.0** on port `3306` for `digital_lanka_db` (App Database).
2. Starts **MySQL 8.0** on port `3307` for `dmt_mock_db` (Statutory DMT Registry DB).
3. Automatically executes `database/01_digital_lanka_app_db.sql` and `database/02_dmt_registry_db.sql` to seed all tables and test records.

### Credentials:
- **Application DB Port**: `3306`
  - Database: `digital_lanka_db` | User: `lanka_user` | Password: `lankapassword`
- **DMT Registry DB Port**: `3307`
  - Database: `dmt_mock_db` | User: `dmt_user` | Password: `dmtpassword`

To stop containers:
```bash
docker compose down
```

---

## 🛠️ Option 2: Import SQL Files into Local MySQL (MySQL Workbench / phpMyAdmin / CLI)

If developers are using local MySQL instances (XAMPP, WAMP, native MySQL Server):

1. **Import Application Database**:
   - Run file: [`database/01_digital_lanka_app_db.sql`](file:///c:/Users/dhana/Desktop/digital_lanka/database/01_digital_lanka_app_db.sql)
   - Command:
     ```bash
     mysql -u root -p < database/01_digital_lanka_app_db.sql
     ```

2. **Import DMT Mock Registry Database**:
   - Run file: [`database/02_dmt_registry_db.sql`](file:///c:/Users/dhana/Desktop/digital_lanka/database/02_dmt_registry_db.sql)
   - Command:
     ```bash
     mysql -u root -p < database/02_dmt_registry_db.sql
     ```

---

## 📁 Database Files Summary
| File Path | Description |
|---|---|
| [`database/01_digital_lanka_app_db.sql`](file:///c:/Users/dhana/Desktop/digital_lanka/database/01_digital_lanka_app_db.sql) | Application DB schema & sample seed data (`citizens`, `vehicles`, `authorizations`, `notifications`, `stolen_recovery_logs`). |
| [`database/02_dmt_registry_db.sql`](file:///c:/Users/dhana/Desktop/digital_lanka/database/02_dmt_registry_db.sql) | Department of Motor Traffic Registry schema & seed data (`driving_licences`, `vehicle_registrations`, `revenue_licenses`, `insurance_policies`, `emission_certificates`). |
| [`docker-compose.yml`](file:///c:/Users/dhana/Desktop/digital_lanka/docker-compose.yml) | Docker Compose configuration for 1-command developer database setup. |
