<?php
require_once '../../config/database.php';
$uid = (int)($_GET['user_id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$uid]);
$rows = $stmt->fetchAll();
foreach ($rows as &$r) $r['images'] = $r['images'] ? json_decode($r['images'], true) : [];
ok(['products' => $rows]);
