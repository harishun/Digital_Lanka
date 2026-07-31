<?php

/**
 * API Key Middleware — DMT Mock API
 *
 * Accepts the API key via either:
 *   1. Header (preferred):        X-Gov-Api-Key: <key>
 *   2. Query parameter (dev only): ?api_key=<key>
 *
 * WARNING: Never use the query parameter in production.
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

    // 1. Header first (preferred)
    $providedKey = $_SERVER['HTTP_X_GOV_API_KEY'] ?? '';

    // 2. Fall back to query parameter
    if (empty($providedKey)) {
        $providedKey = $_GET['api_key'] ?? '';
    }

    if ($providedKey !== $expectedKey) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized. A valid X-Gov-Api-Key header is required.',
            'code'  => 401,
        ]);
        exit;
    }
}
