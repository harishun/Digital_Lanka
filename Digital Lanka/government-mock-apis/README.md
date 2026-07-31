# Government Mock APIs — Digital Lanka

Simulates two Sri Lankan government department databases via REST APIs,
containerised with Docker Compose.

## Services

| Service | URL | Purpose | Publicly Exposed? |
|---|---|---|---|
| **phpMyAdmin** | http://localhost:8080 | Visual database management | ✅ localhost only |
| **MySQL** | localhost:3306 | Shared database server | ✅ localhost only |
| **DRP API** | Internal only: `http://drp-api/api` | Dept. of Registration of Persons | ❌ Docker network only |
| **DMT API** | Internal only: `http://dmt-api/api` | Dept. of Motor Traffic | ❌ Docker network only |

> The DRP and DMT APIs have **no public ports by design**. Only services inside the
> `govnet` Docker network (e.g. your Spring Boot backend container) can reach them.
> All requests also require the `X-Gov-Api-Key` header — see Authentication below.

## Authentication

All API requests require the `X-Gov-Api-Key` header:

```
X-Gov-Api-Key: dl-gov-secret-key-change-in-production
```

The key is set via `GOV_API_KEY` in `docker-compose.yml`. Change it before any deployment.

---

## Quick Start

```bash
# Start all containers (builds images on first run)
docker compose up -d --build

# Check status
docker compose ps

# Stop all containers
docker compose down

# Stop and wipe all data (full reset)
docker compose down -v
```

## phpMyAdmin Login

- **URL:** http://localhost:8080
- **Username:** `root`
- **Password:** `govroot`
- Both databases (`drp_mock_db` and `dmt_mock_db`) are visible in the left panel.

---

## Calling the APIs from Spring Boot

Because the API containers have no public ports, your Spring Boot backend must:

**1. Join the govnet Docker network** — add to your Spring Boot `docker-compose.yml`:

```yaml
networks:
  - government-mock-apis_govnet

# At the bottom of the file:
networks:
  government-mock-apis_govnet:
    external: true
```

**2. Use internal container hostnames** in `application.properties`:

```properties
gov.drp.base-url=http://drp-api/api
gov.dmt.base-url=http://dmt-api/api
gov.api-key=dl-gov-secret-key-change-in-production
```

**3. Attach the header on every outbound call:**

```java
@Value("${gov.api-key}")
private String govApiKey;

// With RestTemplate:
HttpHeaders headers = new HttpHeaders();
headers.set("X-Gov-Api-Key", govApiKey);
HttpEntity<Void> entity = new HttpEntity<>(headers);
RestTemplate restTemplate = new RestTemplate();
ResponseEntity<String> response = restTemplate.exchange(
    drpBaseUrl + "/citizens/nic/" + nic,
    HttpMethod.GET,
    entity,
    String.class
);
```

---

## Testing Locally (Docker exec)

Since the APIs have no public ports, test them by exec-ing into a container:

```bash
# DRP API
docker exec drp_api curl -s \
  -H "X-Gov-Api-Key: dl-gov-secret-key-change-in-production" \
  http://localhost/api/health

# DMT API
docker exec dmt_api curl -s \
  -H "X-Gov-Api-Key: dl-gov-secret-key-change-in-production" \
  http://localhost/api/vehicle-classes
```

## DRP API Endpoints (Port 8081)

| Method | Path                              | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | /api/health                       | Health check              |
| GET    | /api/citizens                     | List all citizens         |
| POST   | /api/citizens                     | Create citizen            |
| GET    | /api/citizens/{id}                | Get by UUID               |
| PUT    | /api/citizens/{id}                | Update by UUID            |
| GET    | /api/citizens/nic/{nic}?api=           | Get by NIC number         |
| GET    | /api/citizens/{id}/photo          | Serve photo               |
| POST   | /api/citizens/{id}/photo          | Upload photo              |
| GET    | /api/citizens/{id}/signature      | Serve signature           |
| POST   | /api/citizens/{id}/signature      | Upload signature          |

### Example: Create a Citizen

```bash
curl -X POST http://localhost:8081/api/citizens \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "K.A. DON PERERA",
    "name_on_card": "K.A. Don Perera",
    "gender": "MALE",
    "date_of_birth": "1985-08-12",
    "nic": "198522405678",
    "ic_number": "IC-0000001",
    "place_of_birth": "Colombo",
    "district_of_birth": "Colombo",
    "address_house": "42/A",
    "address_road": "Galle Road",
    "address_city": "Colombo 03",
    "address_postal_code": "00300",
    "issued_date": "2010-03-15"
  }'
```

## DMT API Endpoints (Port 8082)

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | /api/health                       | Health check                       |
| GET    | /api/vehicle-classes              | List all 14 vehicle class codes    |
| GET    | /api/licences                     | List all licences                  |
| POST   | /api/licences                     | Create licence                     |
| GET    | /api/licences/{id}                | Get by UUID                        |
| PUT    | /api/licences/{id}                | Update by UUID                     |
| GET    | /api/licences/number/{number}     | Get by licence number              |
| GET    | /api/licences/nic/{nic}           | Get by NIC                         |
| GET    | /api/licences/{id}/classes        | Get vehicle classes for licence    |
| POST   | /api/licences/{id}/classes        | Add vehicle classes to licence     |
| GET    | /api/licences/{id}/photo          | Serve photo                        |
| POST   | /api/licences/{id}/photo          | Upload photo                       |
| GET    | /api/licences/{id}/signature      | Serve signature                    |
| POST   | /api/licences/{id}/signature      | Upload signature                   |

### Example: Create a Licence with Vehicle Classes

```bash
curl -X POST http://localhost:8082/api/licences \
  -H "Content-Type: application/json" \
  -d '{
    "licence_number": "DL-9044231-X",
    "nic": "198503402948",
    "surname": "RANAWEERA",
    "other_names": "ARJUN",
    "full_name_on_card": "ARJUN RANAWEERA",
    "gender": "MALE",
    "date_of_birth": "1985-03-04",
    "blood_group": "O+",
    "permanent_address": "No. 15, Kandy Road, Kegalle",
    "organ_donor": false,
    "driver_restrictions": "NONE",
    "vehicle_classes": [
      { "class_code": "B",  "issued_date": "2010-11-12", "expiry_date": "2029-11-12" },
      { "class_code": "B1", "issued_date": "2010-11-12", "expiry_date": "2029-11-12" },
      { "class_code": "G1", "issued_date": "2015-06-20", "expiry_date": "2029-11-12" }
    ]
  }'
```

## Database Credentials

| Field    | Value      |
|----------|------------|
| Host     | localhost  |
| Port     | 3306       |
| Root PW  | govroot    |
| App User | govuser    |
| App PW   | govpass    |
| DRP DB   | drp_mock_db|
| DMT DB   | dmt_mock_db|

## Viewing Logs

```bash
docker logs drp_api
docker logs dmt_api
docker logs gov_mysql
docker logs gov_phpmyadmin
```
