<?php
require_once '../../config/database.php';
$d = input();
$pid = (int)($d['product_id'] ?? 0);
$bid = (int)($d['buyer_id'] ?? 0);
$sid = (int)($d['seller_id'] ?? 0);
if (!$pid || !$bid || !$sid) fail('Missing data');
$stmt = $pdo->prepare("SELECT id FROM conversations WHERE product_id = ? AND buyer_id = ? AND seller_id = ?");
$stmt->execute([$pid, $bid, $sid]);
$row = $stmt->fetch();
if ($row) { ok(['id' => (int)$row['id'], 'existing' => true]); }
$pdo->prepare("INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES (?,?,?)")->execute([$pid, $bid, $sid]);
ok(['id' => (int)$pdo->lastInsertId(), 'existing' => false]);
