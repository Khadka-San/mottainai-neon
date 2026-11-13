<?php
require_once '../../config/database.php';
$uid = (int)$_GET['user_id'];
$products = (int)$pdo->query("SELECT COUNT(*) FROM products WHERE user_id = $uid")->fetchColumn();
$views = (int)$pdo->query("SELECT IFNULL(SUM(views),0) FROM products WHERE user_id = $uid")->fetchColumn();
$sales = (int)$pdo->query("SELECT IFNULL(SUM(quantity),0) FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE p.user_id = $uid")->fetchColumn();
$revenue = (float)$pdo->query("SELECT IFNULL(SUM(oi.price * oi.quantity),0) FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE p.user_id = $uid")->fetchColumn();
ok(['products' => $products, 'views' => $views, 'sales' => $sales, 'revenue' => $revenue]);
