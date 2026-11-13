<?php
require_once '../../config/database.php';
$pid = (int)($_GET['id'] ?? 0);
$uid = (int)($_GET['user_id'] ?? 0);
if ($pid) $pdo->prepare("UPDATE products SET views = views + 1 WHERE id = ?")->execute([$pid]);
if ($uid && $pid) {
    $pdo->prepare("INSERT INTO recently_viewed (user_id, product_id) VALUES (?, ?)")->execute([$uid, $pid]);
}
ok(['ok' => true]);
