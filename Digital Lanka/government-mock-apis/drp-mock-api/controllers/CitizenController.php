<?php

require_once __DIR__ . '/../config/db.php';

/**
 * CitizenController
 *
 * Handles all CRUD operations for the citizens table.
 * Each public method corresponds to a specific REST endpoint.
 */
class CitizenController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/citizens
    //  Returns a paginated list of all citizen records.
    // ────────────────────────────────────────────────────────
    public function index(): void
    {
        $page  = max(1, (int)($_GET['page']  ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare(
            'SELECT id, nic, ic_number, full_name, name_on_card, gender,
                    date_of_birth, place_of_birth, district_of_birth,
                    address_house, address_road, address_city, address_postal_code,
                    issued_date, created_at, updated_at
             FROM citizens
             ORDER BY created_at DESC
             LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $citizens = $stmt->fetchAll();

        $countStmt = $this->db->query('SELECT COUNT(*) FROM citizens');
        $total = (int)$countStmt->fetchColumn();

        $this->jsonResponse([
            'data'       => $citizens,
            'pagination' => [
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int)ceil($total / $limit),
            ],
        ]);
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/citizens/{id}
    //  Returns a single citizen record by UUID.
    // ────────────────────────────────────────────────────────
    public function show(string $id): void
    {
        $citizen = $this->findById($id);
        if (!$citizen) {
            $this->notFound("Citizen with ID '{$id}' not found.");
            return;
        }
        $this->jsonResponse($this->appendMediaUrls($citizen));
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/citizens/nic/{nic}
    //  Returns a citizen record by NIC number.
    // ────────────────────────────────────────────────────────
    public function showByNic(string $nic): void
    {
        $stmt = $this->db->prepare('SELECT * FROM citizens WHERE nic = :nic LIMIT 1');
        $stmt->execute([':nic' => $nic]);
        $citizen = $stmt->fetch();

        if (!$citizen) {
            $this->notFound("No citizen found with NIC '{$nic}'.");
            return;
        }
        $this->jsonResponse($this->appendMediaUrls($citizen));
    }

    // ────────────────────────────────────────────────────────
    //  POST /api/citizens
    //  Creates a new citizen record.
    //  Required body fields: full_name, gender, date_of_birth
    // ────────────────────────────────────────────────────────
    public function store(): void
    {
        $body = $this->parseJsonBody();

        // Validate required fields
        $errors = $this->validateRequired($body, ['full_name', 'gender', 'date_of_birth']);
        if (!empty($errors)) {
            $this->errorResponse(422, 'Validation failed.', $errors);
            return;
        }

        // Validate gender enum
        if (!in_array($body['gender'], ['MALE', 'FEMALE'], true)) {
            $this->errorResponse(422, 'gender must be MALE or FEMALE.');
            return;
        }

        // Check NIC uniqueness if provided
        if (!empty($body['nic'])) {
            $check = $this->db->prepare('SELECT id FROM citizens WHERE nic = :nic');
            $check->execute([':nic' => $body['nic']]);
            if ($check->fetch()) {
                $this->errorResponse(409, "A citizen with NIC '{$body['nic']}' already exists.");
                return;
            }
        }

        $id = $this->generateUUID();

        $stmt = $this->db->prepare(
            'INSERT INTO citizens (
                id, nic, ic_number, full_name, name_on_card, gender, date_of_birth,
                place_of_birth, district_of_birth,
                address_house, address_road, address_city, address_postal_code,
                issued_date, photo_path, signature_path
             ) VALUES (
                :id, :nic, :ic_number, :full_name, :name_on_card, :gender, :date_of_birth,
                :place_of_birth, :district_of_birth,
                :address_house, :address_road, :address_city, :address_postal_code,
                :issued_date, :photo_path, :signature_path
             )'
        );

        $stmt->execute([
            ':id'                  => $id,
            ':nic'                 => $body['nic']                 ?? null,
            ':ic_number'           => $body['ic_number']           ?? null,
            ':full_name'           => $body['full_name'],
            ':name_on_card'        => $body['name_on_card']        ?? null,
            ':gender'              => $body['gender'],
            ':date_of_birth'       => $body['date_of_birth'],
            ':place_of_birth'      => $body['place_of_birth']      ?? null,
            ':district_of_birth'   => $body['district_of_birth']   ?? null,
            ':address_house'       => $body['address_house']       ?? null,
            ':address_road'        => $body['address_road']        ?? null,
            ':address_city'        => $body['address_city']        ?? null,
            ':address_postal_code' => $body['address_postal_code'] ?? null,
            ':issued_date'         => $body['issued_date']         ?? null,
            ':photo_path'          => null,
            ':signature_path'      => null,
        ]);

        $citizen = $this->findById($id);
        http_response_code(201);
        $this->jsonResponse($this->appendMediaUrls($citizen));
    }

    // ────────────────────────────────────────────────────────
    //  PUT /api/citizens/{id}
    //  Updates an existing citizen record.
    // ────────────────────────────────────────────────────────
    public function update(string $id): void
    {
        $citizen = $this->findById($id);
        if (!$citizen) {
            $this->notFound("Citizen with ID '{$id}' not found.");
            return;
        }

        $body = $this->parseJsonBody();

        // Check NIC uniqueness if being changed
        if (!empty($body['nic']) && $body['nic'] !== $citizen['nic']) {
            $check = $this->db->prepare('SELECT id FROM citizens WHERE nic = :nic AND id != :id');
            $check->execute([':nic' => $body['nic'], ':id' => $id]);
            if ($check->fetch()) {
                $this->errorResponse(409, "A citizen with NIC '{$body['nic']}' already exists.");
                return;
            }
        }

        $stmt = $this->db->prepare(
            'UPDATE citizens SET
                nic                 = :nic,
                ic_number           = :ic_number,
                full_name           = :full_name,
                name_on_card        = :name_on_card,
                gender              = :gender,
                date_of_birth       = :date_of_birth,
                place_of_birth      = :place_of_birth,
                district_of_birth   = :district_of_birth,
                address_house       = :address_house,
                address_road        = :address_road,
                address_city        = :address_city,
                address_postal_code = :address_postal_code,
                issued_date         = :issued_date
             WHERE id = :id'
        );

        $stmt->execute([
            ':id'                  => $id,
            ':nic'                 => $body['nic']                 ?? $citizen['nic'],
            ':ic_number'           => $body['ic_number']           ?? $citizen['ic_number'],
            ':full_name'           => $body['full_name']           ?? $citizen['full_name'],
            ':name_on_card'        => $body['name_on_card']        ?? $citizen['name_on_card'],
            ':gender'              => $body['gender']              ?? $citizen['gender'],
            ':date_of_birth'       => $body['date_of_birth']       ?? $citizen['date_of_birth'],
            ':place_of_birth'      => $body['place_of_birth']      ?? $citizen['place_of_birth'],
            ':district_of_birth'   => $body['district_of_birth']   ?? $citizen['district_of_birth'],
            ':address_house'       => $body['address_house']       ?? $citizen['address_house'],
            ':address_road'        => $body['address_road']        ?? $citizen['address_road'],
            ':address_city'        => $body['address_city']        ?? $citizen['address_city'],
            ':address_postal_code' => $body['address_postal_code'] ?? $citizen['address_postal_code'],
            ':issued_date'         => $body['issued_date']         ?? $citizen['issued_date'],
        ]);

        $this->jsonResponse($this->appendMediaUrls($this->findById($id)));
    }

    // ────────────────────────────────────────────────────────
    //  POST /api/citizens/{id}/photo
    //  Uploads a photo for a citizen.
    // ────────────────────────────────────────────────────────
    public function uploadPhoto(string $id): void
    {
        $this->handleFileUpload($id, 'photo', 'photo_path');
    }

    // ────────────────────────────────────────────────────────
    //  POST /api/citizens/{id}/signature
    //  Uploads a signature image for a citizen.
    // ────────────────────────────────────────────────────────
    public function uploadSignature(string $id): void
    {
        $this->handleFileUpload($id, 'signature', 'signature_path');
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/citizens/{id}/photo
    //  Serves the citizen's photo file.
    // ────────────────────────────────────────────────────────
    public function servePhoto(string $id): void
    {
        $this->serveFile($id, 'photo_path');
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/citizens/{id}/signature
    //  Serves the citizen's signature file.
    // ────────────────────────────────────────────────────────
    public function serveSignature(string $id): void
    {
        $this->serveFile($id, 'signature_path');
    }

    // ── Private Helpers ─────────────────────────────────────

    private function findById(string $id): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM citizens WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    private function appendMediaUrls(array $citizen): array
    {
        $base = '/api/citizens/' . $citizen['id'];
        $citizen['photo_url']     = $citizen['photo_path']     ? $base . '/photo'     : null;
        $citizen['signature_url'] = $citizen['signature_path'] ? $base . '/signature' : null;
        // Remove raw file paths from response (internal detail)
        unset($citizen['photo_path'], $citizen['signature_path']);
        return $citizen;
    }

    private function handleFileUpload(string $id, string $fileKey, string $dbColumn): void
    {
        $citizen = $this->findById($id);
        if (!$citizen) {
            $this->notFound("Citizen with ID '{$id}' not found.");
            return;
        }

        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            $this->errorResponse(400, "File upload failed or no file provided for field '{$fileKey}'.");
            return;
        }

        $file     = $_FILES[$fileKey];
        $allowed  = ['image/jpeg', 'image/png', 'image/webp'];
        $mimeType = mime_content_type($file['tmp_name']);

        if (!in_array($mimeType, $allowed, true)) {
            $this->errorResponse(415, 'Only JPEG, PNG, and WebP images are accepted.');
            return;
        }

        $ext      = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mimeType];
        $filename = $id . '_' . $fileKey . '.' . $ext;
        $dest     = __DIR__ . '/../uploads/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            $this->errorResponse(500, 'Failed to save the uploaded file.');
            return;
        }

        $stmt = $this->db->prepare("UPDATE citizens SET {$dbColumn} = :path WHERE id = :id");
        $stmt->execute([':path' => 'uploads/' . $filename, ':id' => $id]);

        $this->jsonResponse(['message' => 'File uploaded successfully.', 'filename' => $filename]);
    }

    private function serveFile(string $id, string $column): void
    {
        $citizen = $this->findById($id);
        if (!$citizen || empty($citizen[$column])) {
            $this->notFound('File not found.');
            return;
        }

        $path = __DIR__ . '/../' . $citizen[$column];
        if (!file_exists($path)) {
            $this->notFound('File not found on disk.');
            return;
        }

        $mime = mime_content_type($path);
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;
    }

    private function generateUUID(): string
    {
        $data    = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // variant RFC 4122
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    private function parseJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    private function validateRequired(array $body, array $fields): array
    {
        $errors = [];
        foreach ($fields as $field) {
            if (empty($body[$field])) {
                $errors[] = "'{$field}' is required.";
            }
        }
        return $errors;
    }

    private function jsonResponse(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    private function notFound(string $message): void
    {
        $this->errorResponse(404, $message);
    }

    private function errorResponse(int $code, string $message, array $details = []): void
    {
        $body = ['error' => $message, 'code' => $code];
        if (!empty($details)) {
            $body['details'] = $details;
        }
        http_response_code($code);
        echo json_encode($body, JSON_PRETTY_PRINT);
        exit;
    }
}
