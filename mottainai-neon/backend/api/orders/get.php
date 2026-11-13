<?php
require_once '../../config/database.php';
$uid = (int)($_GET['user_id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$uid]);
$orders = $stmt->fetchAll();
foreach ($orders as &$o) {
    $it = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $it->execute([$o['id']]);
    $o['items'] = $it->fetchAll();
}
ok(['orders' => $orders]);
