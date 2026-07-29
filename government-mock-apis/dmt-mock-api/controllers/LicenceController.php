<?php

require_once __DIR__ . '/../config/db.php';

/**
 * LicenceController
 *
 * Handles CRUD operations for driving_licences and licence_vehicle_classes,
 * plus vehicle registration lookups from vehicle_registrations.
 */
class LicenceController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/licences
    //  Returns a paginated list of all licence records.
    // ────────────────────────────────────────────────────────
    public function index(): void
    {
        $page   = max(1, (int)($_GET['page']  ?? 1));
        $limit  = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare(
            'SELECT id, licence_number, nic, surname, other_names, full_name_on_card,
                    gender, date_of_birth, blood_group, height_ft, height_inches,
                    permanent_address, organ_donor, driver_restrictions,
                    created_at, updated_at
             FROM driving_licences
             ORDER BY created_at DESC
             LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $licences = $stmt->fetchAll();

        $countStmt = $this->db->query('SELECT COUNT(*) FROM driving_licences');
        $total = (int)$countStmt->fetchColumn();

        $this->jsonResponse([
            'data'       => array_map(fn($l) => $this->appendMediaUrls($l), $licences),
            'pagination' => [
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int)ceil($total / $limit),
            ],
        ]);
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/licences/{id}
    //  Returns a single licence with all its vehicle classes.
    // ────────────────────────────────────────────────────────
    public function show(string $id): void
    {
        $licence = $this->findById($id);
        if (!$licence) {
            $this->notFound("Licence with ID '{$id}' not found.");
            return;
        }

        $licence['vehicle_classes'] = $this->getClasses($licence['nic']);
        $this->jsonResponse($this->appendMediaUrls($licence));
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/licences/number/{number}
    //  Looks up a licence by its printed licence number.
    // ────────────────────────────────────────────────────────
    public function showByNumber(string $number): void
    {
        $stmt = $this->db->prepare('SELECT * FROM driving_licences WHERE licence_number = :n LIMIT 1');
        $stmt->execute([':n' => $number]);
        $licence = $stmt->fetch();

        if (!$licence) {
            $this->notFound("Licence number '{$number}' not found.");
            return;
        }

        $licence['vehicle_classes'] = $this->getClasses($licence['nic']);
        $this->jsonResponse($this->appendMediaUrls($licence));
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/licences/nic/{nic}
    //  Returns all licence records linked to a NIC.
    // ────────────────────────────────────────────────────────
    public function showByNic(string $nic): void
    {
        $stmt = $this->db->prepare('SELECT * FROM driving_licences WHERE nic = :nic');
        $stmt->execute([':nic' => $nic]);
        $licences = $stmt->fetchAll();

        if (empty($licences)) {
            $this->notFound("No licences found for NIC '{$nic}'.");
            return;
        }

        $result = [];
        foreach ($licences as $licence) {
            $licence['vehicle_classes'] = $this->getClasses($licence['nic']);
            $result[] = $this->appendMediaUrls($licence);
        }

        $this->jsonResponse($result);
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/licences/{id}/classes
    //  Returns only the vehicle classes for a licence.
    // ────────────────────────────────────────────────────────
    public function showClasses(string $id): void
    {
        $licence = $this->findById($id);
        if (!$licence) {
            $this->notFound("Licence with ID '{$id}' not found.");
            return;
        }
        $this->jsonResponse($this->getClasses($licence['nic']));
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/vehicle-classes
    //  Returns all 14 official DMT vehicle class definitions.
    // ────────────────────────────────────────────────────────
    public function listClassDefinitions(): void
    {
        $stmt = $this->db->query('SELECT * FROM vehicle_class_definitions ORDER BY class_code');
        $this->jsonResponse($stmt->fetchAll());
    }

    // ────────────────────────────────────────────────────────
    //  POST /api/licences
    //  Creates a new licence record.
    // ────────────────────────────────────────────────────────
    public function store(): void
    {
        $data = $this->parseJsonBody();
        $this->validateRequired($data, ['nic', 'surname', 'full_name_on_card', 'gender', 'date_of_birth', 'permanent_address']);

        $id = $this->generateUUID();
        $stmt = $this->db->prepare(
            'INSERT INTO driving_licences
             (id, licence_number, nic, surname, other_names, full_name_on_card,
              gender, date_of_birth, blood_group, height_ft, height_inches,
              permanent_address, organ_donor, driver_restrictions)
             VALUES (:id, :licence_number, :nic, :surname, :other_names, :full_name_on_card,
                     :gender, :date_of_birth, :blood_group, :height_ft, :height_inches,
                     :permanent_address, :organ_donor, :driver_restrictions)'
        );

        $stmt->execute([
            ':id'               => $id,
            ':licence_number'   => $data['licence_number']   ?? null,
            ':nic'              => $data['nic'],
            ':surname'          => $data['surname'],
            ':other_names'      => $data['other_names']      ?? null,
            ':full_name_on_card'=> $data['full_name_on_card'],
            ':gender'           => $data['gender'],
            ':date_of_birth'    => $data['date_of_birth'],
            ':blood_group'      => $data['blood_group']      ?? null,
            ':height_ft'        => $data['height_ft']        ?? null,
            ':height_inches'    => $data['height_inches']    ?? null,
            ':permanent_address'=> $data['permanent_address'],
            ':organ_donor'      => (int)($data['organ_donor'] ?? 0),
            ':driver_restrictions' => $data['driver_restrictions'] ?? 'NONE',
        ]);

        if (!empty($data['vehicle_classes']) && is_array($data['vehicle_classes'])) {
            $this->insertClasses($data['nic'], $data['vehicle_classes']);
        }

        $created = $this->findById($id);
        $created['vehicle_classes'] = $this->getClasses($data['nic']);
        http_response_code(201);
        $this->jsonResponse($created);
    }

    // ────────────────────────────────────────────────────────
    //  PUT /api/licences/{id}
    //  Updates an existing licence by UUID.
    // ────────────────────────────────────────────────────────
    public function update(string $id): void
    {
        $licence = $this->findById($id);
        if (!$licence) {
            $this->notFound("Licence with ID '{$id}' not found.");
            return;
        }

        $data = $this->parseJsonBody();
        $stmt = $this->db->prepare(
            'UPDATE driving_licences SET
               licence_number    = COALESCE(:licence_number, licence_number),
               surname           = COALESCE(:surname, surname),
               other_names       = COALESCE(:other_names, other_names),
               full_name_on_card = COALESCE(:full_name_on_card, full_name_on_card),
               gender            = COALESCE(:gender, gender),
               date_of_birth     = COALESCE(:date_of_birth, date_of_birth),
               blood_group       = COALESCE(:blood_group, blood_group),
               height_ft         = COALESCE(:height_ft, height_ft),
               height_inches     = COALESCE(:height_inches, height_inches),
               permanent_address = COALESCE(:permanent_address, permanent_address),
               organ_donor       = COALESCE(:organ_donor, organ_donor),
               driver_restrictions = COALESCE(:driver_restrictions, driver_restrictions)
             WHERE id = :id'
        );

        $stmt->execute([
            ':id'               => $id,
            ':licence_number'   => $data['licence_number']      ?? null,
            ':surname'          => $data['surname']             ?? null,
            ':other_names'      => $data['other_names']         ?? null,
            ':full_name_on_card'=> $data['full_name_on_card']   ?? null,
            ':gender'           => $data['gender']              ?? null,
            ':date_of_birth'    => $data['date_of_birth']       ?? null,
            ':blood_group'      => $data['blood_group']         ?? null,
            ':height_ft'        => $data['height_ft']           ?? null,
            ':height_inches'    => $data['height_inches']       ?? null,
            ':permanent_address'=> $data['permanent_address']   ?? null,
            ':organ_donor'      => isset($data['organ_donor']) ? (int)$data['organ_donor'] : null,
            ':driver_restrictions' => $data['driver_restrictions'] ?? null,
        ]);

        $updated = $this->findById($id);
        $updated['vehicle_classes'] = $this->getClasses($updated['nic']);
        $this->jsonResponse($this->appendMediaUrls($updated));
    }

    // ────────────────────────────────────────────────────────
    //  POST /api/licences/{id}/classes
    //  Bulk-adds vehicle classes to a licence.
    // ────────────────────────────────────────────────────────
    public function addClasses(string $id): void
    {
        $licence = $this->findById($id);
        if (!$licence) {
            $this->notFound("Licence with ID '{$id}' not found.");
            return;
        }

        $data = $this->parseJsonBody();
        if (empty($data['vehicle_classes']) || !is_array($data['vehicle_classes'])) {
            $this->errorResponse('vehicle_classes array is required.', 422);
            return;
        }

        $this->insertClasses($licence['nic'], $data['vehicle_classes']);
        $this->jsonResponse($this->getClasses($licence['nic']));
    }

    // ────────────────────────────────────────────────────────
    //  POST /api/licences/{id}/photo  (upload)
    //  GET  /api/licences/{id}/photo  (serve)
    // ────────────────────────────────────────────────────────
    public function uploadPhoto(string $id): void    { $this->handleFileUpload($id, 'photo',     'photo_path'); }
    public function uploadSignature(string $id): void { $this->handleFileUpload($id, 'signature', 'signature_path'); }
    public function servePhoto(string $id): void     { $this->serveFile($id, 'photo_path'); }
    public function serveSignature(string $id): void  { $this->serveFile($id, 'signature_path'); }

    // ────────────────────────────────────────────────────────
    //  GET /api/vehicles/by-owner/{nic}
    //  Returns all registered vehicles owned by the given NIC.
    // ────────────────────────────────────────────────────────
    public function showByOwnerNic(string $nic): void
    {
        $stmt = $this->db->prepare(
            'SELECT id, plate_number, doc_no, issue_date, expiry_date, authority,
                    chassis_no, engine_no, fuel_type, model, vehicle_class, owner_nic
             FROM vehicle_registrations
             WHERE owner_nic = :nic
             ORDER BY plate_number'
        );
        $stmt->execute([':nic' => $nic]);
        $rows = $stmt->fetchAll();

        if (empty($rows)) {
            $this->jsonResponse([]);
            return;
        }

        $vehicles = array_map(fn($r) => $this->formatVehicleRow($r), $rows);
        $this->jsonResponse($vehicles);
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/vehicles/{plateNumber}
    //  Returns a single vehicle registration by plate number.
    // ────────────────────────────────────────────────────────
    public function showVehicleByPlate(string $plateNumber): void
    {
        $decoded = urldecode($plateNumber);
        $stmt = $this->db->prepare(
            'SELECT id, plate_number, doc_no, issue_date, expiry_date, authority,
                    chassis_no, engine_no, fuel_type, model, vehicle_class, owner_nic
             FROM vehicle_registrations
             WHERE plate_number = :plate LIMIT 1'
        );
        $stmt->execute([':plate' => $decoded]);
        $row = $stmt->fetch();

        if (!$row) {
            $this->notFound("Vehicle with plate number '{$decoded}' not found.");
            return;
        }

        $this->jsonResponse($this->formatVehicleRow($row));
    }

    // ────────────────────────────────────────────────────────
    //  GET /api/vehicles/{id}/documents
    //  Returns VRC + revenue license + insurance + emission for a vehicle.
    //  Accepts either the internal ID (v1, v2…) or the plate number.
    // ────────────────────────────────────────────────────────
    public function showDocuments(string $vehicleId): void
    {
        // Try to resolve by plate_number first (for plate-number-based callers)
        $decoded = urldecode($vehicleId);
        $stmt = $this->db->prepare(
            'SELECT id, plate_number FROM vehicle_registrations WHERE plate_number = :plate LIMIT 1'
        );
        $stmt->execute([':plate' => $decoded]);
        $byPlate = $stmt->fetch();

        // Fall back to id-based lookup (for legacy v1-v5 callers)
        if ($byPlate) {
            $resolvedId   = $byPlate['id'];
            $plateDisplay = $byPlate['plate_number'];
        } else {
            $stmt2 = $this->db->prepare(
                'SELECT id, plate_number FROM vehicle_registrations WHERE id = :vid LIMIT 1'
            );
            $stmt2->execute([':vid' => $decoded]);
            $byId = $stmt2->fetch();
            if (!$byId) {
                $this->notFound("Vehicle '{$decoded}' not found.");
                return;
            }
            $resolvedId   = $byId['id'];
            $plateDisplay = $byId['plate_number'];
        }

        // 1. Fetch VRC Registration
        $stmt = $this->db->prepare('SELECT * FROM vehicle_registrations WHERE id = :vid LIMIT 1');
        $stmt->execute([':vid' => $resolvedId]);
        $vrc = $stmt->fetch();

        // 2. Fetch Revenue License
        $stmt = $this->db->prepare('SELECT * FROM revenue_licenses WHERE vehicle_id = :vid LIMIT 1');
        $stmt->execute([':vid' => $resolvedId]);
        $revenue = $stmt->fetch();

        // 3. Fetch Insurance Policy
        $stmt = $this->db->prepare('SELECT * FROM insurance_policies WHERE vehicle_id = :vid LIMIT 1');
        $stmt->execute([':vid' => $resolvedId]);
        $insurance = $stmt->fetch();

        // 4. Fetch Emission Test Certificate
        $stmt = $this->db->prepare('SELECT * FROM emission_certificates WHERE vehicle_id = :vid LIMIT 1');
        $stmt->execute([':vid' => $resolvedId]);
        $emission = $stmt->fetch();

        $this->jsonResponse([
            'vehicle_id' => $plateDisplay,
            'vrc' => $vrc ? [
                'docNo'       => $vrc['doc_no'],
                'plateNumber' => $vrc['plate_number'],
                'issueDate'   => $vrc['issue_date'],
                'expiryDate'  => $vrc['expiry_date'],
                'authority'   => $vrc['authority'],
                'chassisNo'   => $vrc['chassis_no'],
                'engineNo'    => $vrc['engine_no'],
                'fuelType'    => $vrc['fuel_type']
            ] : null,
            'revenue' => $revenue ? [
                'licenseNo'  => $revenue['license_no'],
                'issueDate'  => $revenue['issue_date'],
                'expiryDate' => $revenue['expiry_date'],
                'authority'  => $revenue['authority'],
                'status'     => $revenue['status'],
                'fee'        => $revenue['fee']
            ] : null,
            'insurance' => $insurance ? [
                'policyNo'   => $insurance['policy_no'],
                'underwriter'=> $insurance['underwriter'],
                'policyType' => $insurance['policy_type'],
                'issueDate'  => $insurance['issue_date'],
                'expiryDate' => $insurance['expiry_date'],
                'premium'    => $insurance['premium']
            ] : null,
            'emission' => $emission ? [
                'testNo'        => $emission['test_no'],
                'testingCenter' => $emission['testing_center'],
                'result'        => $emission['result'],
                'issueDate'     => $emission['issue_date'],
                'expiryDate'    => $emission['expiry_date'],
                'coValue'       => $emission['co_value'],
                'hcValue'       => $emission['hc_value']
            ] : null
        ]);
    }

    // ═══════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════

    /** Formats a vehicle_registrations DB row into a clean API response object. */
    private function formatVehicleRow(array $row): array
    {
        return [
            'id'           => $row['plate_number'], // Use plate number as the canonical vehicle ID
            'plateNumber'  => $row['plate_number'],
            'docNo'        => $row['doc_no'],
            'issueDate'    => $row['issue_date'],
            'expiryDate'   => $row['expiry_date'],
            'authority'    => $row['authority'],
            'chassisNo'    => $row['chassis_no'],
            'engineNo'     => $row['engine_no'],
            'fuelType'     => $row['fuel_type'],
            'model'        => $row['model'],
            'vehicleClass' => $row['vehicle_class'],
            'ownerNic'     => $row['owner_nic'],
        ];
    }

    private function findById(string $id): array|false
    {
        $stmt = $this->db->prepare('SELECT * FROM driving_licences WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    private function getClasses(string $nic): array
    {
        $stmt = $this->db->prepare(
            'SELECT lvc.id, lvc.class_code, lvc.issued_date, lvc.expiry_date,
                    vcd.description, vcd.category, vcd.min_age
             FROM licence_vehicle_classes lvc
             JOIN vehicle_class_definitions vcd ON lvc.class_code = vcd.class_code
             WHERE lvc.nic = :nic
             ORDER BY lvc.class_code'
        );
        $stmt->execute([':nic' => $nic]);
        return $stmt->fetchAll();
    }

    private function insertClasses(string $nic, array $classes): void
    {
        $stmt = $this->db->prepare(
            'INSERT IGNORE INTO licence_vehicle_classes
                 (id, nic, class_code, issued_date, expiry_date)
             VALUES (:id, :nic, :class_code, :issued_date, :expiry_date)'
        );
        foreach ($classes as $cls) {
            $stmt->execute([
                ':id'          => $this->generateUUID(),
                ':nic'         => $nic,
                ':class_code'  => $cls['class_code'],
                ':issued_date' => $cls['issued_date'],
                ':expiry_date' => $cls['expiry_date'],
            ]);
        }
    }

    private function appendMediaUrls(array $licence): array
    {
        $base = rtrim(
            (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
            . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'),
            '/'
        );
        $licence['photo_url']     = $licence['photo_path']     ? "{$base}/api/licences/{$licence['id']}/photo"     : null;
        $licence['signature_url'] = $licence['signature_path'] ? "{$base}/api/licences/{$licence['id']}/signature" : null;
        return $licence;
    }

    private function handleFileUpload(string $id, string $fileKey, string $dbColumn): void
    {
        $licence = $this->findById($id);
        if (!$licence) { $this->notFound("Licence '{$id}' not found."); return; }

        if (empty($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            $this->errorResponse("File '{$fileKey}' missing or upload error.", 422);
            return;
        }

        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        $mime    = mime_content_type($_FILES[$fileKey]['tmp_name']);
        if (!in_array($mime, $allowed, true)) {
            $this->errorResponse("Only JPEG, PNG or WebP images are accepted.", 422);
            return;
        }

        $ext      = pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION) ?: 'jpg';
        $dir      = __DIR__ . '/../storage/';
        if (!is_dir($dir)) { mkdir($dir, 0775, true); }
        $filename = "{$id}_{$fileKey}.{$ext}";
        $dest     = $dir . $filename;

        if (!move_uploaded_file($_FILES[$fileKey]['tmp_name'], $dest)) {
            $this->errorResponse('Failed to save uploaded file.', 500);
            return;
        }

        $stmt = $this->db->prepare("UPDATE driving_licences SET {$dbColumn} = :path WHERE id = :id");
        $stmt->execute([':path' => $dest, ':id' => $id]);

        $updated = $this->findById($id);
        $this->jsonResponse($this->appendMediaUrls($updated));
    }

    private function serveFile(string $id, string $column): void
    {
        $licence = $this->findById($id);
        if (!$licence || empty($licence[$column])) {
            $this->notFound('File not found.');
            return;
        }

        $path = $licence[$column];
        if (!file_exists($path)) { $this->notFound('File missing on disk.'); return; }

        $mime = mime_content_type($path) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: max-age=86400');
        readfile($path);
        exit;
    }

    private function generateUUID(): string
    {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    private function parseJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    private function validateRequired(array $data, array $fields): void
    {
        $missing = array_filter($fields, fn($f) => empty($data[$f]));
        if (!empty($missing)) {
            $this->errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
            exit;
        }
    }

    private function jsonResponse(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function notFound(string $message = 'Not found.'): void
    {
        $this->errorResponse($message, 404);
    }

    private function errorResponse(string $message, int $code = 400, array $details = []): void
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
