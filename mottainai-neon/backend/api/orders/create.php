<?php
require_once '../../config/database.php';
$d = input();
$uid = (int)($d['user_id'] ?? 0);
if (!$uid) fail('Login required');

$items = $d['items'] ?? [];
if (!$items) fail('Cart empty');

$total = (float)($d['total'] ?? 0);
$discount = (float)($d['discount'] ?? 0);
$coupon = trim($d['coupon_code'] ?? '');
$finalTotal = max(0, $total - $discount);
$points = (int)floor($finalTotal / 10);

$pdo->beginTransaction();
try {
    // Insert order
    $pdo->prepare("INSERT INTO orders (user_id, shipping_address, payment_method, total_amount, discount, coupon_code, points_awarded, status) VALUES (?,?,?,?,?,?,?, 'Pending')")
        ->execute([$uid, $d['shipping_address'] ?? '', $d['payment_method'] ?? 'PayPay', $finalTotal, $discount, $coupon, $points]);
    $oid = (int)$pdo->lastInsertId();
    
    // Insert order items with SAFE image handling
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) VALUES (?,?,?,?,?,?)");
    
    foreach ($items as $it) {
        // ✅ Safely get image and truncate to 500 chars
        $img = '';
        if (isset($it['images']) && is_array($it['images']) && count($it['images']) > 0) {
            $img = (string)$it['images'][0];
        } elseif (isset($it['image'])) {
            $img = (string)$it['image'];
        }
        // Truncate to safe length
        if (strlen($img) > 500) {
            $img = substr($img, 0, 500);
        }
        // Truncate product name
        $name = substr((string)($it['name'] ?? 'Product'), 0, 200);
        
        $stmt->execute([
            $oid, 
            (int)($it['id'] ?? 0), 
            $name, 
            $img, 
            (float)($it['price'] ?? 0), 
            (int)($it['quantity'] ?? 1)
        ]);
    }
    
    // Update user points
    $pdo->prepare("UPDATE users SET mottainai_points = mottainai_points + ? WHERE id = ?")->execute([$points, $uid]);
    
    // Update level
    $u = $pdo->prepare("SELECT mottainai_points FROM users WHERE id = ?");
    $u->execute([$uid]);
    $pts = (int)$u->fetch()['mottainai_points'];
    $level = $pts >= 1000 ? 'Platinum' : ($pts >= 500 ? 'Gold' : ($pts >= 100 ? 'Silver' : 'Bronze'));
    $pdo->prepare("UPDATE users SET level = ? WHERE id = ?")->execute([$level, $uid]);
    
    if ($coupon) $pdo->prepare("UPDATE coupons SET uses = uses + 1 WHERE code = ?")->execute([$coupon]);
    
    $pdo->commit();
    ok(['order_id' => $oid, 'points_awarded' => $points, 'level' => $level]);
} catch (Exception $e) {
    $pdo->rollBack();
    fail('Order failed: ' . $e->getMessage() . ' | Line: ' . $e->getLine());
}
