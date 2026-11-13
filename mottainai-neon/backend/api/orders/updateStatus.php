<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/database.php';
$d = input();
$id = (int)($d['id'] ?? 0);
$status = trim($d['status'] ?? 'Pending');
$payment = trim($d['payment_method'] ?? '');

if (!$id) fail('Order ID required');

// Valid statuses
$valid = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
if (!in_array($status, $valid)) fail('Invalid status');

// Update order
if ($payment) {
    $pdo->prepare("UPDATE orders SET status = ?, payment_method = ? WHERE id = ?")
        ->execute([$status, $payment, $id]);
} else {
    $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?")
        ->execute([$status, $id]);
}

ok(['updated' => true, 'status' => $status]);
