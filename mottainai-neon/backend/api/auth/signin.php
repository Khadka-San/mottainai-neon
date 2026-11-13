<?php
require_once '../../config/database.php';
$d = input();
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([trim($d['email'] ?? '')]);
$u = $stmt->fetch();
if (!$u) fail('Email not found');
if (!password_verify($d['password'] ?? '', $u['password'])) fail('Wrong password');
ok(['user' => [
    'id' => (int)$u['id'], 'name' => $u['name'], 'email' => $u['email'],
    'avatar_initial' => $u['avatar_initial'],
    'mottainai_points' => (int)$u['mottainai_points'],
    'level' => $u['level'], 'is_admin' => (int)$u['is_admin']
   // At the end before ok():
$pdo->prepare("UPDATE users SET last_active = NOW() WHERE id = ?")->execute([$user['id']]);

]]);
