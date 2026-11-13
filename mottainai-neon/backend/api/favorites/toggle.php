<?php
require_once '../../config/database.php';
$d = input();
$chk = $pdo->prepare("SELECT id FROM favorites WHERE user_id = ? AND product_id = ?");
$chk->execute([(int)$d['user_id'], (int)$d['product_id']]);
if ($chk->fetch()) {
    $pdo->prepare("DELETE FROM favorites WHERE user_id = ? AND product_id = ?")->execute([(int)$d['user_id'], (int)$d['product_id']]);
    ok(['favorited' => false]);
}
$pdo->prepare("INSERT INTO favorites (user_id, product_id) VALUES (?,?)")->execute([(int)$d['user_id'], (int)$d['product_id']]);
ok(['favorited' => true]);
