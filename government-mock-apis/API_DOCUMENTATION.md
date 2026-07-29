# Government Mock APIs — API Reference Documentation

**Digital Lanka Project**
Version: 1.0.0 · Base Environment: Docker (Local Development)

---

## Overview

Two independent REST APIs simulate read/write access to Sri Lankan government department
databases. The main Digital Lanka Spring Boot backend calls these APIs exactly as it would
call real government endpoints in production (Phase 3 of the SSR roadmap).

| Service | Department | Base URL | Port |
|---|---|---|---|
| **DRP API** | Department of Registration of Persons | `http://localhost:8081/api` | 8081 |
| **DMT API** | Department of Motor Traffic | `http://localhost:8082/api` | 8082 |
| **phpMyAdmin** | Database Dashboard | `http://localhost:8080` | 8080 |

---

## General Conventions

### Request Format
- All request bodies must be `Content-Type: application/json`
- File uploads use `multipart/form-data`
- Date fields follow **ISO 8601**: `YYYY-MM-DD`

### Response Format
All responses return JSON. Successful responses return the resource directly (or wrapped
in a `data` + `pagination` object for list endpoints).

```json
// Single resource
{ "id": "uuid", "field": "value", ... }

// List response
{
  "data": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### CORS
Both APIs return `Access-Control-Allow-Origin: *` — safe for local development.

### Authentication
None — these are internal mock services. The main Spring Boot backend handles JWT auth.

---

## Error Responses

All errors return a consistent JSON structure:

```json
{
  "error": "Human-readable message",
  "code": 404,
  "details": ["Optional array of field-level validation errors"]
}
```

| HTTP Code | Meaning |
|---|---|
| `400` | Bad request / missing file |
| `404` | Resource not found |
| `409` | Conflict — duplicate NIC, licence number, etc. |
| `415` | Unsupported media type (file uploads — only JPEG/PNG/WebP accepted) |
| `422` | Validation failed — see `details` array |
| `500` | Server error |

---
---

# DRP API — Department of Registration of Persons

**Base URL:** `http://localhost:8081/api`

Simulates the national citizen identity registry. Built from the official NIC Application
Form "B" (Registration of Persons Act No. 32 of 1968).

---

## Data Model: Citizen

| Field | Type | Nullable | Description |
|---|---|---|---|
| `id` | `string (UUID)` | No | System-generated primary key |
| `nic` | `string` | **Yes** | National Identity Card number (`9+V/X` or 12-digit). Nullable if pending issuance |
| `ic_number` | `string` | Yes | DRP office-assigned internal registry number |
| `full_name` | `string` | No | Full name in English block letters (Form Cage 2) |
| `name_on_card` | `string` | Yes | Name to print on card if different from `full_name` (Form Cage 3) |
| `gender` | `enum` | No | `MALE` or `FEMALE` |
| `date_of_birth` | `date` | No | Format: `YYYY-MM-DD` |
| `place_of_birth` | `string` | Yes | City/town of birth |
| `district_of_birth` | `string` | Yes | Administrative district |
| `address_house` | `string` | Yes | House name or number |
| `address_road` | `string` | Yes | Road / Street / Lane |
| `address_city` | `string` | Yes | Village or City |
| `address_postal_code` | `string` | Yes | Postal code |
| `issued_date` | `date` | Yes | Date NIC was issued. Nullable if card not yet produced |
| `photo_url` | `string` | Yes | URL to retrieve the citizen's photo (read-only, derived) |
| `signature_url` | `string` | Yes | URL to retrieve the citizen's signature (read-only, derived) |
| `created_at` | `datetime` | No | Record creation timestamp |
| `updated_at` | `datetime` | No | Last update timestamp |

---

## DRP Endpoints

### `GET /health`
Health check — confirms the service is running.

**Response `200`**
```json
{
  "status": "ok",
  "service": "DRP Mock API",
  "timestamp": "2026-07-08T08:00:00+00:00"
}
```

---

### `GET /citizens`
Returns a paginated list of all citizen records.

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Records per page (max 100) |

**Example Request**
```
GET http://localhost:8081/api/citizens?page=1&limit=10
```

**Response `200`**
```json
{
  "data": [
    {
      "id": "5997302d-2ef1-49eb-9703-4844f1f9fff7",
      "nic": "198522405678",
      "ic_number": "IC-0000001",
      "full_name": "K.A. DON PERERA",
      "name_on_card": "K.A. Don Perera",
      "gender": "MALE",
      "date_of_birth": "1985-08-12",
      "place_of_birth": "Colombo",
      "district_of_birth": "Colombo",
      "address_house": "42/A",
      "address_road": "Galle Road",
      "address_city": "Colombo 03",
      "address_postal_code": "00300",
      "issued_date": "2010-03-15",
      "created_at": "2026-07-08 08:20:49",
      "updated_at": "2026-07-08 08:20:49",
      "photo_url": null,
      "signature_url": null
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

---

### `POST /citizens`
Creates a new citizen record.

**Required Fields:** `full_name`, `gender`, `date_of_birth`

**Request Body**
```json
{
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
}
```

**Response `201`** — Returns the created citizen object.

**Error `409`** — NIC already exists.
```json
{ "error": "A citizen with NIC '198522405678' already exists.", "code": 409 }
```

**Error `422`** — Validation failed.
```json
{
  "error": "Validation failed.",
  "code": 422,
  "details": ["'full_name' is required.", "'gender' is required."]
}
```

---

### `GET /citizens/{id}`
Fetch a single citizen by their UUID.

**Example Request**
```
GET http://localhost:8081/api/citizens/5997302d-2ef1-49eb-9703-4844f1f9fff7
```

**Response `200`** — Citizen object.
**Error `404`**
```json
{ "error": "Citizen with ID 'xxx' not found.", "code": 404 }
```

---

### `GET /citizens/nic/{nic}`
Fetch a citizen by their NIC number. **Primary lookup used by the Spring Boot backend.**

**Example Request**
```
GET http://localhost:8081/api/citizens/nic/198522405678
```

**Response `200`** — Citizen object.
**Error `404`**
```json
{ "error": "No citizen found with NIC '198522405678'.", "code": 404 }
```

---

### `PUT /citizens/{id}`
Updates an existing citizen record. All fields are optional — only provided fields are changed.

**Request Body** — Any subset of writable citizen fields:
```json
{
  "nic": "198522405678",
  "issued_date": "2010-03-15",
  "address_city": "Colombo 05"
}
```

**Response `200`** — Updated citizen object.

---

### `POST /citizens/{id}/photo`
Upload a passport-style photo.

**Request** — `multipart/form-data`, field name: `photo`
Accepted: JPEG, PNG, WebP

**Response `200`**
```json
{ "message": "File uploaded successfully.", "filename": "5997302d-..._photo.jpg" }
```

---

### `GET /citizens/{id}/photo`
Serves the citizen's photo as a binary image stream.

**Response** — Binary image (`Content-Type: image/jpeg` etc.)
**Error `404`** — No photo uploaded yet.

---

### `POST /citizens/{id}/signature`
Upload a signature image. Field name: `signature`.

### `GET /citizens/{id}/signature`
Serves the citizen's signature as a binary image stream.

---
---

# DMT API — Department of Motor Traffic

**Base URL:** `http://localhost:8082/api`

Simulates the national driving licence registry. Built from the official Driving Licence
Application Form MTA 30/2 (Motor Traffic Act Chapter 203).

---

## Data Model: Driving Licence

| Field | Type | Nullable | Description |
|---|---|---|---|
| `id` | `string (UUID)` | No | System-generated primary key |
| `licence_number` | `string` | **Yes** | Official licence number (e.g. `DL-9044231-X`). Nullable if pending |
| `nic` | `string` | Yes | Links to DRP citizen. Nullable |
| `surname` | `string` | No | Applicant surname |
| `other_names` | `string` | Yes | Given names |
| `full_name_on_card` | `string` | No | Name as printed on the physical card |
| `gender` | `enum` | No | `MALE` or `FEMALE` |
| `date_of_birth` | `date` | No | Format: `YYYY-MM-DD` |
| `blood_group` | `enum` | Yes | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `height_ft` | `integer` | Yes | Height (feet component) |
| `height_inches` | `integer` | Yes | Height (inches component) |
| `permanent_address` | `string` | No | Full address text |
| `organ_donor` | `boolean` | No | Default `false` |
| `driver_restrictions` | `enum` | No | `NONE`, `CORRECTIVE_LENSES`, `ARTIFICIAL_LIMB` |
| `vehicle_classes` | `array` | — | Included in detail responses (see Vehicle Class model) |
| `photo_url` | `string` | Yes | URL to retrieve photo |
| `signature_url` | `string` | Yes | URL to retrieve signature |
| `created_at` | `datetime` | No | Record creation timestamp |
| `updated_at` | `datetime` | No | Last update timestamp |

---

## Data Model: Vehicle Class

Each element in the `vehicle_classes` array returned on a licence:

| Field | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | Row identifier |
| `class_code` | `string` | Official code: `A1`, `A`, `B1`, `B`, `C1`, `C`, `CE`, `D1`, `D`, `DE`, `G1`, `G`, `J`, `PT` |
| `description` | `string` | Full description from official DMT definitions |
| `category` | `string` | `Motorcycle`, `Light Vehicle`, `Heavy Vehicle`, `Passenger Transport`, `Agricultural`, `Special`, `Endorsement` |
| `min_age` | `integer` | Minimum age required by law |
| `issued_date` | `date` | Date this class was granted on the licence |
| `expiry_date` | `date` | Expiry date for this specific class |

---

## Vehicle Class Codes Reference

| Code | Description | Category | Min Age |
|---|---|---|---|
| `A1` | Motorcycle Engine Capacity < 100cc | Motorcycle | 18 |
| `A` | Motorcycle Engine Capacity > 100cc | Motorcycle | 18 |
| `B1` | Motor Tricycle - Tare < 500kg, GVW > 1000kg | Light Vehicle | 18 |
| `B` | All Cars/Dual Purpose - GVW < 3500kg, Passengers < 8, Trailer < 250kg | Light Vehicle | 18 |
| `C1` | Light Motor Lorry - 3500kg < GVW < 17000kg, Trailer < 750kg | Heavy Vehicle | 21 |
| `C` | Motor Lorry - GVW > 17000kg, Trailer < 750kg | Heavy Vehicle | 21 |
| `CE` | Heavy Motor Lorry - GVW > 17000kg, Trailer > 750kg | Heavy Vehicle | 21 |
| `D1` | Light Motor Coach - Passengers < 32, Trailer < 750kg | Passenger Transport | 21 |
| `D` | Motor Coach - Passengers > 32, Trailer < 750kg | Passenger Transport | 21 |
| `DE` | Heavy Motor Coach - Trailer > 750kg | Passenger Transport | 21 |
| `G1` | Two Wheel Tractor with a Trailer | Agricultural | 18 |
| `G` | Agricultural Land Vehicle with or without a Trailer | Agricultural | 18 |
| `J` | Special Purpose Vehicle | Special | 21 |
| `PT` | Public Transport Endorsement | Endorsement | 23 |

---

## DMT Endpoints

### `GET /health`
**Response `200`**
```json
{
  "status": "ok",
  "service": "DMT Mock API",
  "timestamp": "2026-07-08T08:00:00+00:00"
}
```

---

### `GET /vehicle-classes`
Returns all 14 official vehicle class definitions.

**Example Request**
```
GET http://localhost:8082/api/vehicle-classes
```

**Response `200`**
```json
[
  { "class_code": "A1", "description": "Motorcycle Engine Capacity < 100cc", "category": "Motorcycle", "min_age": 18 },
  { "class_code": "B",  "description": "All Cars/Dual Purpose - GVW < 3500kg...", "category": "Light Vehicle", "min_age": 18 },
  ...
]
```

---

### `GET /licences`
Returns a paginated list of all licence records (without vehicle classes).

**Query Parameters:** `page` (default 1), `limit` (default 20, max 100)

---

### `POST /licences`
Creates a new driving licence record with optional vehicle classes in one request.

**Required Fields:** `full_name_on_card`, `surname`, `gender`, `date_of_birth`, `permanent_address`

**Request Body**
```json
{
  "licence_number": "DL-9044231-X",
  "nic": "198503402948",
  "surname": "RANAWEERA",
  "other_names": "ARJUN",
  "full_name_on_card": "ARJUN RANAWEERA",
  "gender": "MALE",
  "date_of_birth": "1985-03-04",
  "blood_group": "O+",
  "height_ft": 5,
  "height_inches": 10,
  "permanent_address": "No. 15, Kandy Road, Kegalle",
  "organ_donor": false,
  "driver_restrictions": "NONE",
  "vehicle_classes": [
    { "class_code": "B",  "issued_date": "2010-11-12", "expiry_date": "2029-11-12" },
    { "class_code": "B1", "issued_date": "2010-11-12", "expiry_date": "2029-11-12" },
    { "class_code": "G1", "issued_date": "2015-06-20", "expiry_date": "2029-11-12" }
  ]
}
```

**Response `201`** — Full licence object including populated `vehicle_classes` array.

---

### `GET /licences/{id}`
Fetch a single licence by UUID, including all vehicle classes.

---

### `GET /licences/number/{licenceNumber}`
Fetch a licence by its official licence number string.

**Example Request**
```
GET http://localhost:8082/api/licences/number/DL-9044231-X
```

**Response `200`** — Full licence object with `vehicle_classes`.

---

### `GET /licences/nic/{nic}`
Fetch all licences belonging to a NIC. **Primary lookup used by the Spring Boot backend.**

**Example Request**
```
GET http://localhost:8082/api/licences/nic/198503402948
```

**Response `200`** — Array of licence objects, each with `vehicle_classes`.

---

### `PUT /licences/{id}`
Update an existing licence. Partial updates supported. Does **not** modify vehicle classes.

**Request Body** — Any subset of writable fields:
```json
{
  "blood_group": "O+",
  "driver_restrictions": "CORRECTIVE_LENSES"
}
```

---

### `GET /licences/{id}/classes`
Returns only the vehicle classes for a licence.

---

### `POST /licences/{id}/classes`
Add vehicle classes to an existing licence.

**Request Body** — JSON array:
```json
[
  { "class_code": "C",  "issued_date": "2020-05-10", "expiry_date": "2030-05-10" },
  { "class_code": "CE", "issued_date": "2020-05-10", "expiry_date": "2030-05-10" }
]
```

**Response `200`**
```json
{
  "message": "Vehicle classes added.",
  "vehicle_classes": [ ... ]
}
```

> Duplicate class codes on the same licence are silently ignored.

---

### `POST /licences/{id}/photo`
Upload a photo. `multipart/form-data`, field name: `photo`. Accepted: JPEG, PNG, WebP.

### `GET /licences/{id}/photo`
Serves the photo as a binary image stream.

### `POST /licences/{id}/signature`
Upload a signature image. Field name: `signature`.

### `GET /licences/{id}/signature`
Serves the signature as a binary image stream.

---
---

# Integration Guide for Spring Boot Backend

## application.properties

```properties
gov.drp.base-url=http://localhost:8081/api
gov.dmt.base-url=http://localhost:8082/api
```

## Common Lookup Patterns

### Verify a citizen's identity at registration
```
GET {DRP_BASE}/citizens/nic/{nic}
→ 200: citizen found, proceed with registration
→ 404: NIC not in DRP registry, reject
```

### Load driving licence for officer Compliance Hub
```
GET {DMT_BASE}/licences/nic/{nic}
→ 200: returns licence + vehicle_classes[]
→ use blood_group directly from response
→ filter vehicle_classes where expiry_date > today for active classes
```

### Verify vehicle class eligibility for access delegation
```
GET {DMT_BASE}/licences/nic/{nic}
→ filter vehicle_classes[].class_code IN ['B','B1', ...]
→ check expiry_date > today
```

## File Storage Note

Photos and signatures are stored in Docker named volumes:
- `drp_uploads` → `/var/www/html/uploads` inside `drp_api`
- `dmt_uploads` → `/var/www/html/uploads` inside `dmt_api`

Data persists across `docker compose down`. Only `docker compose down -v` wipes files.
