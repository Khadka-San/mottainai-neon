<?php
require_once '../../config/database.php';
$uid = (int)($_GET['user_id'] ?? 0);
$stmt = $pdo->prepare("
    SELECT c.*, p.name AS product_name, p.images AS product_images,
           buyer.name AS buyer_name, seller.name AS seller_name,
           (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
           (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread
    FROM conversations c
    JOIN products p ON c.product_id = p.id
    JOIN users buyer ON c.buyer_id = buyer.id
    JOIN users seller ON c.seller_id = seller.id
    WHERE c.buyer_id = ? OR c.seller_id = ?
    ORDER BY c.last_message_at DESC
");
$stmt->execute([$uid, $uid, $uid]);
$rows = $stmt->fetchAll();
foreach ($rows as &$r) {
    $imgs = $r['product_images'] ? json_decode($r['product_images'], true) : [];
    $r['product_image'] = $imgs[0] ?? '';
}
ok(['conversations' => $rows]);
