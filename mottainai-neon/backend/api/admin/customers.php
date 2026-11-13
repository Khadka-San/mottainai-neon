<?php
require_once '../../config/database.php';
$rows = $pdo->query("SELECT id, name, email, mottainai_points, level, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC")->fetchAll();
ok(['customers' => $rows]);
