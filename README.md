# Digital Lanka — Integrated Traffic & Asset Hub

A modern smart ecosystem for digitalizing citizen identity credentials, driving authorization parameters, and traffic compliance enforcement.

---

## 🚀 How to Run the Application

This project consists of three main components that work together:
1. **Mock Government APIs** (PHP + MySQL in Docker)
2. **Spring Boot Backend** (Java + separate MySQL DB)
3. **React Frontend** (Vite SPA)

Follow these steps sequentially to launch the system:

### 1. Start the Government Mock APIs (Port 8081 & 8082)
The mock APIs simulate the Department of Registration of Persons (DRP) and the Department of Motor Traffic (DMT).
1. Open a terminal and navigate to the mock API folder:
   ```bash
   cd government-mock-apis
   ```
2. Start the Docker containers:
   ```bash
   docker compose up -d --build
   ```
   *This starts DRP REST API at `http://localhost:8081`, DMT REST API at `http://localhost:8082`, and the MySQL database server.*

### 2. Start the Core Spring Boot Backend (Port 8080)
The backend acts as the core traffic and asset engine, connecting to a separate database server.
1. Open a new terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Start the separate database container for the application:
   ```bash
   docker compose up -d
   ```
   *This launches the application database `app_mysql` running on port `3307`.*
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will boot up, automatically create the schemas in `digital_lanka_db`, and listen on `http://localhost:8080`.*

### 3. Launch the React Frontend (Port 5173)
The civilian wallet web interface displaying smart e-NICs, driving logs, and traffic citation ledgers.
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd UI/digital_lanka
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the local address:
   ```text
   http://localhost:5173
   ```

---

## 🛠️ Tech Stack & Directory Structure

*   **`UI/digital_lanka/`**: React 19, Vite 8, Google Fonts, and Google Material Icons CDN.
*   **`backend/`**: Spring Boot 3, Hibernate JPA, Spring Security, MySQL Connector.
*   **`government-mock-apis/`**: Slim PHP mock containers simulating REST microservices.
