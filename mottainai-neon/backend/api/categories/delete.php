<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/database.php';
$d = input();
$id = (int)($d['id'] ?? 0);
if (!$id) fail('Category ID required');

$pdo->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
ok(['deleted' => true]);
