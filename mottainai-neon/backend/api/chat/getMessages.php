<?php
require_once '../../config/database.php';
$cid = (int)($_GET['conversation_id'] ?? 0);
$stmt = $pdo->prepare("SELECT m.*, u.name AS sender_name, u.avatar_initial FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.conversation_id = ? ORDER BY m.created_at ASC");
$stmt->execute([$cid]);
ok(['messages' => $stmt->fetchAll()]);
