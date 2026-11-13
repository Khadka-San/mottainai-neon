<?php
require_once '../../config/database.php';
$d = input();
$uid = (int)($d['user_id'] ?? 0);
$pid = (int)($d['id'] ?? 0);
if (!$pid) fail('Product ID required');

// Get product
$stmt = $pdo->prepare("SELECT user_id, images FROM products WHERE id = ?");
$stmt->execute([$pid]);
$p = $stmt->fetch();
if (!$p) fail('Product not found');

// Check permissions: admin OR owner
$userCheck = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$userCheck->execute([$uid]);
$user = $userCheck->fetch();
$isAdmin = $user && (int)$user['is_admin'] === 1;
$isOwner = (int)$p['user_id'] === $uid;
if (!$isAdmin && !$isOwner) fail('Not allowed');

// Build update fields
$fields = ['name','price','original_price','category','condition_label','description','location','is_free','is_eco','status'];
$sets = []; 
$params = [];
foreach ($fields as $f) {
    if (isset($d[$f])) { $sets[] = "$f = ?"; $params[] = $d[$f]; }
}

// ✅ FIX: Only update images if the new value is non-empty
if (isset($d['images']) && is_array($d['images']) && count($d['images']) > 0) {
    $sets[] = "images = ?";
    $params[] = json_encode(array_slice($d['images'], 0, 5));
}

if (!$sets) fail('Nothing to update');
$params[] = $pid;
$pdo->prepare("UPDATE products SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
ok(['updated' => true, 'images_preserved' => !isset($d['images']) || count($d['images'] ?? []) === 0]);
