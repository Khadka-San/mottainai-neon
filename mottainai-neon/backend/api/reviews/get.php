<?php
require_once '../../config/database.php';
$pid = (int)$_GET['product_id'];
$stmt = $pdo->prepare("SELECT r.*, u.name AS user_name, u.avatar_initial FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC");
$stmt->execute([$pid]);
ok(['reviews' => $stmt->fetchAll()]);
