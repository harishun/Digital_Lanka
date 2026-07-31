<?php

/**
 * API Key Middleware
 *
 * Accepts the API key via either:
 *   1. Header (preferred):        X-Gov-Api-Key: <key>
 *   2. Query parameter (dev only): ?api_key=<key>
 *
 * The header method is always preferred. The query parameter exists
 * purely for convenience when testing in a browser address bar.
 *
 * WARNING: Never use the query parameter in production — the key will
 * appear in server access logs and browser history.
 *
 * The key is injected via Docker Compose GOV_API_KEY environment variable.
 */

function requireApiKey(): void
{
    $expectedKey = getenv('GOV_API_KEY');

    if (empty($expectedKey)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Server misconfiguration: GOV_API_KEY environment variable is not set.',
            'code'  => 500,
        ]);
        exit;
    }

    // 1. Check the header first (preferred, secure)
    $providedKey = $_SERVER['HTTP_X_GOV_API_KEY'] ?? '';

    // 2. Fall back to query parameter (dev convenience only)
    if (empty($providedKey)) {
        $providedKey = $_GET['api_key'] ?? '';
    }

    if ($providedKey !== $expectedKey) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized. Provide the API key via the X-Gov-Api-Key header or ?api_key= query parameter.',
            'code'  => 401,
        ]);
        exit;
    }
}
