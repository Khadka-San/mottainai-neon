<?php
require_once '../../config/database.php';
$d = input();
$pdo->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?")
    ->execute([(int)$d['conversation_id'], (int)$d['user_id']]);
ok(['updated' => true]);
