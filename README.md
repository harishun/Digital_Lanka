# Digital Lanka - Roadside Traffic Enforcement System

This project is a web application developed for digital traffic law enforcement and citizen services in Sri Lanka. It connects a React frontend with a Spring Boot REST API backend to allow police officers to check vehicle registrations, verify driving licenses, and issue digital citations on the road.

## Tech Stack
- Backend: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL / H2
- Frontend: React 18, Vite, Tailwind CSS, Axios
- Build Tools: Gradle (backend), npm (frontend)

## Key Features
- Police Officer Dashboard:
  - Lookup vehicle registration details by number plate.
  - Check insurance and road tax (revenue license) validity.
  - Automated alert for reported stolen vehicles with a direct bike seizure action button.
  - Smart driving license card preview with multi-class vehicle endorsements.
  - Issue digital traffic citations with GPS coordinates and timestamps.
- Citizen Portal:
  - View personal driving license card in standard ID card aspect ratio.
  - Check pending traffic citations and fine payment status.
- Admin Portal:
  - Manage citation records and system users.

## Project Structure
- backend/ : Spring Boot API server (runs on port 8081)
- frontend/ : React Vite client application (runs on port 5173)

## How to Run Locally

### 1. Start the Backend Server
Open a terminal and navigate to the backend directory:
```bash
cd backend
./gradlew bootRun
```
The API server will start on http://localhost:8081.

### 2. Start the Frontend Server
Open a second terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at http://localhost:5173 (or via the port 3000 redirect server).

## Sample Testing Data

### Officer Credentials (Roadside Enforcement)
- NIC / Badge Number: OFFICER123
- Password: password

### Citizen Credentials
- NIC: 901234567V
- Password: password

### Test Vehicle Number Plates
- WP CAD-1234 (Status: STOLEN - use this to test the stolen vehicle alert and bike seizure button)
- WP LA-9999 (Status: ACTIVE - all compliance records valid)
- CBA-1234 (Status: ACTIVE - expired revenue license)

### Test Driver NICs for License Verification
- 197204509123 (W.M. Sugathadasa - 4 vehicle classes: A1, A, B, G1)
- 198503402948 (Arjun Ranaweera - 2 vehicle classes: A, B)
- 199003402948 (K.A. Don Perera - 1 vehicle class: B)
- 198012304958 (Mahinda Rathnayake - heavy commercial classes: C1, C, CE)
