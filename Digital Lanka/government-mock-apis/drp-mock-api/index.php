<?php

/**
 * DRP Mock API — Front Controller / Router
 * Department of Registration of Persons
 *
 * Parses the request URI and method, then dispatches to
 * the appropriate CitizenController method.
 *
 * All requests (except OPTIONS preflight) require the header:
 *   X-Gov-Api-Key: <GOV_API_KEY env value>
 *
 * Endpoint map:
 *   GET    /api/health                   → health check
 *   GET    /api/citizens                 → list all (paginated)
 *   POST   /api/citizens                 → create new citizen
 *   GET    /api/citizens/{id}            → get by UUID
 *   PUT    /api/citizens/{id}            → update by UUID
 *   GET    /api/citizens/nic/{nic}       → get by NIC
 *   GET    /api/citizens/{id}/photo      → serve photo file
 *   GET    /api/citizens/{id}/signature  → serve signature file
 *   POST   /api/citizens/{id}/photo      → upload photo
 *   POST   /api/citizens/{id}/signature  → upload signature
 */

// ── CORS headers (allow Spring Boot backend to call this API) ───────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request (no auth needed for preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Authentication ───────────────────────────────────────────────────────────
// All non-preflight requests must carry a valid X-Gov-Api-Key header.
require_once __DIR__ . '/middleware/auth.php';
//requireApiKey();

// ── Bootstrap ───────────────────────────────────────────────────────────────
require_once __DIR__ . '/controllers/CitizenController.php';

$method = $_SERVER['REQUEST_METHOD'];
// Strip query string and leading slash, then split into segments
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = trim($uri, '/');
$parts  = explode('/', $uri);

// Expected structure: api / citizens / ...
// parts[0] = 'api', parts[1] = resource, parts[2] = id or sub-resource

$resource = $parts[1] ?? '';

// ── Health check ────────────────────────────────────────────────────────────
if ($resource === 'health') {
    echo json_encode(['status' => 'ok', 'service' => 'DRP Mock API', 'timestamp' => date('c')]);
    exit;
}

// ── Route to CitizenController ───────────────────────────────────────────────
if ($resource === 'citizens') {
    $controller = new CitizenController();
    $segment2   = $parts[2] ?? null; // could be an ID, 'nic'
    $segment3   = $parts[3] ?? null; // could be a NIC value, 'photo', 'signature'

    // GET /api/citizens/nic/{nic}
    if ($method === 'GET' && $segment2 === 'nic' && $segment3 !== null) {
        $controller->showByNic(urldecode($segment3));
        exit;
    }

    // GET/POST /api/citizens/{id}/photo
    if ($segment3 === 'photo' && $segment2 !== null) {
        if ($method === 'GET')  $controller->servePhoto($segment2);
        if ($method === 'POST') $controller->uploadPhoto($segment2);
        exit;
    }

    // GET/POST /api/citizens/{id}/signature
    if ($segment3 === 'signature' && $segment2 !== null) {
        if ($method === 'GET')  $controller->serveSignature($segment2);
        if ($method === 'POST') $controller->uploadSignature($segment2);
        exit;
    }

    // GET /api/citizens/{id}  |  PUT /api/citizens/{id}
    if ($segment2 !== null) {
        if ($method === 'GET') $controller->show($segment2);
        if ($method === 'PUT') $controller->update($segment2);
        exit;
    }

    // GET /api/citizens  |  POST /api/citizens
    if ($method === 'GET')  $controller->index();
    if ($method === 'POST') $controller->store();
    exit;
}

// ── 404 fallback ────────────────────────────────────────────────────────────
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found.', 'code' => 404]);
