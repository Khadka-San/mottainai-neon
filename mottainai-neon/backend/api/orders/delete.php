<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/database.php';
$d = input();
$ids = $d['ids'] ?? [];
$single = isset($d['id']) ? [(int)$d['id']] : [];
$all = array_merge($single, is_array($ids) ? $ids : []);

if (!$all) fail('No order IDs provided');

// Sanitize
$all = array_filter(array_map('intval', $all));
if (!$all) fail('Invalid IDs');

$placeholders = implode(',', array_fill(0, count($all), '?'));
$stmt = $pdo->prepare("DELETE FROM orders WHERE id IN ($placeholders)");
$stmt->execute($all);

// order_items will be deleted automatically due to CASCADE
ok(['deleted' => count($all), 'ids' => $all]);
