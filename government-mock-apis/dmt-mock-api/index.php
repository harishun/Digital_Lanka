<?php

/**
 * DMT Mock API — Front Controller / Router
 * Department of Motor Traffic
 *
 * All requests (except OPTIONS preflight) require the header:
 *   X-Gov-Api-Key: <GOV_API_KEY env value>
 *
 * Endpoint map:
 *   GET    /api/health                         → health check
 *   GET    /api/vehicle-classes                → list all class definitions
 *   GET    /api/licences                       → list all (paginated)
 *   POST   /api/licences                       → create new licence
 *   GET    /api/licences/{id}                  → get by UUID
 *   PUT    /api/licences/{id}                  → update by UUID
 *   GET    /api/licences/number/{number}       → get by licence number
 *   GET    /api/licences/nic/{nic}             → get by NIC
 *   GET    /api/licences/{id}/classes          → get vehicle classes for licence
 *   POST   /api/licences/{id}/classes          → add vehicle classes to licence
 *   GET    /api/licences/{id}/photo            → serve photo file
 *   POST   /api/licences/{id}/photo            → upload photo
 *   GET    /api/licences/{id}/signature        → serve signature file
 *   POST   /api/licences/{id}/signature        → upload signature
 */

// ── CORS headers ─────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Authentication ───────────────────────────────────────────────────────────
require_once __DIR__ . '/middleware/auth.php';
requireApiKey();

// ── Bootstrap ────────────────────────────────────────────────────────────────
require_once __DIR__ . '/controllers/LicenceController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = trim($uri, '/');
$parts  = explode('/', $uri);

$resource = $parts[1] ?? '';

// ── Health check ─────────────────────────────────────────────────────────────
if ($resource === 'health') {
    echo json_encode(['status' => 'ok', 'service' => 'DMT Mock API', 'timestamp' => date('c')]);
    exit;
}

// ── Vehicle class definitions ─────────────────────────────────────────────────
if ($resource === 'vehicle-classes' && $method === 'GET') {
    $controller = new LicenceController();
    $controller->listClassDefinitions();
    exit;
}

// ── Licence routes ────────────────────────────────────────────────────────────
if ($resource === 'licences') {
    $controller = new LicenceController();
    $segment2   = $parts[2] ?? null;   // id, 'number', 'nic'
    $segment3   = $parts[3] ?? null;   // nic/number value, 'classes', 'photo', 'signature'

    // GET /api/licences/number/{number}
    if ($method === 'GET' && $segment2 === 'number' && $segment3 !== null) {
        $controller->showByNumber(urldecode($segment3));
        exit;
    }

    // GET /api/licences/nic/{nic}
    if ($method === 'GET' && $segment2 === 'nic' && $segment3 !== null) {
        $controller->showByNic(urldecode($segment3));
        exit;
    }

    // GET|POST /api/licences/{id}/classes
    if ($segment2 !== null && $segment3 === 'classes') {
        if ($method === 'GET')  $controller->showClasses($segment2);
        if ($method === 'POST') $controller->addClasses($segment2);
        exit;
    }

    // GET|POST /api/licences/{id}/photo
    if ($segment2 !== null && $segment3 === 'photo') {
        if ($method === 'GET')  $controller->servePhoto($segment2);
        if ($method === 'POST') $controller->uploadPhoto($segment2);
        exit;
    }

    // GET|POST /api/licences/{id}/signature
    if ($segment2 !== null && $segment3 === 'signature') {
        if ($method === 'GET')  $controller->serveSignature($segment2);
        if ($method === 'POST') $controller->uploadSignature($segment2);
        exit;
    }

    // GET /api/licences/{id}  |  PUT /api/licences/{id}
    if ($segment2 !== null) {
        if ($method === 'GET') $controller->show($segment2);
        if ($method === 'PUT') $controller->update($segment2);
        exit;
    }

    // GET /api/licences  |  POST /api/licences
    if ($method === 'GET')  $controller->index();
    if ($method === 'POST') $controller->store();
    exit;
}

// ── Vehicle routes ────────────────────────────────────────────────────────────
if ($resource === 'vehicles') {
    $controller = new LicenceController();
    $segment2   = $parts[2] ?? null;   // 'by-owner' | vehicle plate/id
    $segment3   = $parts[3] ?? null;   // nic value | 'documents'

    // GET /api/vehicles/by-owner/{nic}
    if ($method === 'GET' && $segment2 === 'by-owner' && $segment3 !== null) {
        $controller->showByOwnerNic(urldecode($segment3));
        exit;
    }

    // GET /api/vehicles/{id}/documents
    if ($method === 'GET' && $segment2 !== null && $segment3 === 'documents') {
        $controller->showDocuments($segment2);
        exit;
    }

    // GET /api/vehicles/{plateNumber}  (single vehicle lookup by plate)
    if ($method === 'GET' && $segment2 !== null && $segment3 === null) {
        $controller->showVehicleByPlate($segment2);
        exit;
    }
}

// ── 404 fallback ──────────────────────────────────────────────────────────────
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found.', 'code' => 404]);
