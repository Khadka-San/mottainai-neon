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
$singleId = (int)($d['id'] ?? 0);

// ✅ Handle single message ID
if ($singleId && empty($ids) && !$convId) {
    $ids = [$singleId];
}

$pdo->beginTransaction();
try {
    $deleted = 0;
    
    // Delete specific messages (single or multiple)
    if (!empty($ids)) {
        $ids = array_filter(array_map('intval', $ids));
        if ($ids) {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id IN ($placeholders)");
            $stmt->execute(array_values($ids));
            $deleted = $stmt->rowCount();
        }
    }
    
    // Delete entire conversation (and all its messages)
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
