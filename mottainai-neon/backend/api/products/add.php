<?php
require_once '../../config/database.php';
$d = input();
$uid = (int)($d['user_id'] ?? 0);
if (!$uid) fail('Login required');

$name = trim($d['name'] ?? '');
if (!$name) fail('Name required');

$imgs = $d['images'] ?? [];
if (!is_array($imgs)) $imgs = [];
$imgs = array_slice(array_filter($imgs), 0, 3);
$imgsJson = json_encode($imgs);

try {
    $stmt = $pdo->prepare("INSERT INTO products (user_id, name, price, original_price, category, condition_label, description, images, location, is_free, is_eco) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $uid, 
        $name, 
        (float)($d['price'] ?? 0), 
        (float)($d['original_price'] ?? 0),
        trim($d['category'] ?? 'Other'), 
        trim($d['condition_label'] ?? 'Used'),
        trim($d['description'] ?? ''), 
        $imgsJson,
        trim($d['location'] ?? ''), 
        !empty($d['is_free']) ? 1 : 0, 
        !empty($d['is_eco']) ? 1 : 0
    ]);
    ok(['id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    fail('DB error: ' . $e->getMessage());
}
