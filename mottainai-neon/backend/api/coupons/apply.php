<?php
require_once '../../config/database.php';
$code = strtoupper(trim($_GET['code'] ?? ''));
$stmt = $pdo->prepare("SELECT * FROM coupons WHERE code = ? AND active = 1");
$stmt->execute([$code]);
$c = $stmt->fetch();
if (!$c) fail('Invalid coupon');
if ($c['uses'] >= $c['max_uses']) fail('Coupon expired');
ok(['coupon' => $c, 'discount_percent' => (int)$c['discount_percent']]);
