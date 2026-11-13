<?php
require_once '../../config/database.php';
$rows = $pdo->query("SELECT c.*, p.name AS product_name, b.name AS buyer_name, s.name AS seller_name FROM conversations c JOIN products p ON c.product_id = p.id JOIN users b ON c.buyer_id = b.id JOIN users s ON c.seller_id = s.id")->fetchAll();
ok(['conversations' => $rows]);
