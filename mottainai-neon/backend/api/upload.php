<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$dir = __DIR__ . '/../uploads/';
if (!is_dir($dir)) mkdir($dir, 0777, true);

if (!isset($_FILES['file'])) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Use: ' . implode(', ', $allowed)]);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'error' => 'File too large (max 5MB)']);
    exit;
}

$name = uniqid('img_', true) . '.' . $ext;
$path = $dir . $name;

if (!move_uploaded_file($file['tmp_name'], $path)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save file. Check folder permissions.']);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => [
        'url' => 'backend/uploads/' . $name,
        'filename' => $name,
        'size' => $file['size']
    ]
]);
