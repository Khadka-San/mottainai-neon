<?php
require_once '../../config/database.php';
$d = input();
$chk = $pdo->prepare("SELECT id FROM follows WHERE follower_id = ? AND seller_id = ?");
$chk->execute([(int)$d['user_id'], (int)$d['seller_id']]);
if ($chk->fetch()) {
    $pdo->prepare("DELETE FROM follows WHERE follower_id = ? AND seller_id = ?")->execute([(int)$d['user_id'], (int)$d['seller_id']]);
    ok(['following' => false]);
}
$pdo->prepare("INSERT INTO follows (follower_id, seller_id) VALUES (?,?)")->execute([(int)$d['user_id'], (int)$d['seller_id']]);
ok(['following' => true]);
