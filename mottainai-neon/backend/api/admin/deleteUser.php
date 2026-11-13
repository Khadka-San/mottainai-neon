<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/database.php';
$d = input();
$ids = $d['ids'] ?? [];

if (!$ids) fail('No user IDs provided');
$ids = array_filter(array_map('intval', $ids));

// Don't delete admins
$placeholders = implode(',', array_fill(0, count($ids), '?'));
$stmt = $pdo->prepare("DELETE FROM users WHERE id IN ($placeholders) AND is_admin = 0");
$stmt->execute(array_values($ids));

ok(['deleted' => $stmt->rowCount()]);
