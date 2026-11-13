<?php
require_once '../../config/database.php';
$d = input();
$name = trim($d['name'] ?? '');
$email = trim($d['email'] ?? '');
$pass = $d['password'] ?? '';
if (!$name || !$email || !$pass) fail('All fields required');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Invalid email');

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) fail('Email already exists');

$hash = password_hash($pass, PASSWORD_DEFAULT);
$ini = strtoupper(substr($name, 0, 1));
$pdo->prepare("INSERT INTO users (name, email, password, avatar_initial) VALUES (?,?,?,?)")
    ->execute([$name, $email, $hash, $ini]);

$id = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO addresses (user_id, country) VALUES (?, 'Japan')")->execute([$id]);

ok(['user' => userById($id)]);
function userById($id) {
    global $pdo;
    $u = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $u->execute([$id]);
    $r = $u->fetch();
    return [
        'id' => (int)$r['id'], 'name' => $r['name'], 'email' => $r['email'],
        'avatar_initial' => $r['avatar_initial'],
        'mottainai_points' => (int)$r['mottainai_points'],
        'level' => $r['level'], 'is_admin' => (int)$r['is_admin']
    ];
}
