<?php
require_once '../../config/database.php';
$d = input();
$uid = (int)$d['user_id'];
$chk = $pdo->prepare("SELECT id FROM addresses WHERE user_id = ?");
$chk->execute([$uid]);
if ($chk->fetch()) {
    $pdo->prepare("UPDATE addresses SET address_line=?, city=?, postal_code=?, country=? WHERE user_id=?")
        ->execute([$d['address_line'] ?? '', $d['city'] ?? '', $d['postal_code'] ?? '', $d['country'] ?? 'Japan', $uid]);
} else {
    $pdo->prepare("INSERT INTO addresses (user_id, address_line, city, postal_code, country) VALUES (?,?,?,?,?)")
        ->execute([$uid, $d['address_line'] ?? '', $d['city'] ?? '', $d['postal_code'] ?? '', $d['country'] ?? 'Japan']);
}
ok(['saved' => true]);
