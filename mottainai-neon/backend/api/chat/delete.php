<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/database.php';
$d = input();
$ids = $d['ids'] ?? [];
$convId = (int)($d['conversation_id'] ?? 0);

$pdo->beginTransaction();
try {
    $deleted = 0;
    
    // Delete specific messages
    if (!empty($ids)) {
        $ids = array_filter(array_map('intval', $ids));
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("DELETE FROM messages WHERE id IN ($placeholders)");
        $stmt->execute(array_values($ids));
        $deleted = $stmt->rowCount();
    }
    
    // Or delete entire conversation
    if ($convId) {
        $pdo->prepare("DELETE FROM messages WHERE conversation_id = ?")->execute([$convId]);
        $pdo->prepare("DELETE FROM conversations WHERE id = ?")->execute([$convId]);
        $deleted = 'all';
    }
    
    $pdo->commit();
    ok(['deleted' => $deleted]);
} catch (Exception $e) {
    $pdo->rollBack();
    fail($e->getMessage());
}
