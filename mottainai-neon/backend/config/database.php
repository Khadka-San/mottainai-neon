<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$DB_HOST = 'localhost';
$DB_NAME = 'mottainai_neon';
$DB_USER = 'root';
$DB_PASS = 'root';

try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'DB: ' . $e->getMessage()]);
    exit;
}

function input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!$data) $data = $_POST;
    return $data ?: [];
}

function ok($d) { echo json_encode(['success' => true, 'data' => $d]); exit; }
function fail($m, $c = 400) { http_response_code($c); echo json_encode(['success' => false, 'error' => $m]); exit; }
