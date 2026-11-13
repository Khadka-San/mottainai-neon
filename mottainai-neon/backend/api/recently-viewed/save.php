<?php
require_once '../../config/database.php';
$d = input();
$pdo->prepare("INSERT INTO recently_viewed (user_id, product_id) VALUES (?,?)")
    ->execute([(int)$d['user_id'], (int)$d['product_id']]);
ok(['ok' => true]);
