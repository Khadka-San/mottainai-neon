<?php
require_once '../../config/database.php';
$rev = (float)$pdo->query("SELECT IFNULL(SUM(total_amount),0) FROM orders")->fetchColumn();
$orders = (int)$pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$customers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE is_admin = 0")->fetchColumn();
$products = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
ok(['revenue' => $rev, 'orders' => $orders, 'customers' => $customers, 'products' => $products]);
