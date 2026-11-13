<?php
require_once '../../config/database.php';
$rows = $pdo->query("SELECT p.*, u.name AS seller_name FROM products p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC")->fetchAll();
foreach ($rows as &$r) $r['images'] = $r['images'] ? json_decode($r['images'], true) : [];
ok(['products' => $rows]);
