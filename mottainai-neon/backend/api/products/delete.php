<?php
require_once '../../config/database.php';
$d = input();
$pid = (int)($d['id'] ?? 0);
$uid = (int)($d['user_id'] ?? 0);
if (!$pid) fail('Product ID required');

$stmt = $pdo->prepare("SELECT p.user_id, u.is_admin FROM products p JOIN users u ON u.id = ? WHERE p.id = ?");
$stmt->execute([$uid, $pid]);
$row = $stmt->fetch();
if (!$row) fail('Product not found');

$isAdmin = (int)$row['is_admin'] === 1;
$isOwner = (int)$row['user_id'] === $uid;

if (!$isAdmin && !$isOwner) fail('Not allowed');

$pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$pid]);
ok(['deleted' => true]);
