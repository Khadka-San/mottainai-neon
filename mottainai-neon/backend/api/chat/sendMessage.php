<?php
require_once '../../config/database.php';
$d = input();
$cid = (int)($d['conversation_id'] ?? 0);
$sid = (int)($d['sender_id'] ?? 0);
$msg = trim($d['message'] ?? '');
if (!$cid || !$sid || !$msg) fail('Missing fields');
$pdo->prepare("INSERT INTO messages (conversation_id, sender_id, message) VALUES (?,?,?)")->execute([$cid, $sid, $msg]);
$pdo->prepare("UPDATE conversations SET last_message_at = NOW() WHERE id = ?")->execute([$cid]);
ok(['id' => (int)$pdo->lastInsertId()]);
