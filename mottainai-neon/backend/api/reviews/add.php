<?php
require_once '../../config/database.php';
$d = input();
$pid = (int)$d['product_id'];
$uid = (int)$d['user_id'];
$rating = max(1, min(5, (int)$d['rating']));
$pdo->prepare("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)")
    ->execute([$pid, $uid, $rating, $d['comment'] ?? '']);
$avg = $pdo->prepare("SELECT AVG(rating) AS a, COUNT(*) AS c FROM reviews WHERE product_id = ?");
$avg->execute([$pid]);
$r = $avg->fetch();
$pdo->prepare("UPDATE products SET rating_avg = ?, rating_count = ? WHERE id = ?")
    ->execute([$r['a'], $r['c'], $pid]);
ok(['saved' => true, 'avg' => round((float)$r['a'], 2)]);
