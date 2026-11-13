<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/database.php';

// Note: We use waste_heatmap-style approach since categories aren't a separate table
// Categories are stored as a string field in products table
// For a proper categories table, you'd need to create one

$d = input();
$name = trim($d['name'] ?? '');
$icon = trim($d['icon'] ?? '📦');
$desc = trim($d['description'] ?? '');

if (!$name) fail('Category name required');
if (strlen($name) > 50) fail('Category name too long');

// For now, we'll save to a JSON file or create a settings table
// Since we don't have a categories table, let's create one
$check = $pdo->query("SHOW TABLES LIKE 'categories'")->fetch();
if (!$check) {
    $pdo->exec("CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(10) DEFAULT '📦',
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

try {
    $stmt = $pdo->prepare("INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)");
    $stmt->execute([$name, $icon, $desc]);
    ok(['id' => (int)$pdo->lastInsertId(), 'name' => $name]);
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate') !== false) {
        fail('Category already exists');
    }
    fail('Database error: ' . $e->getMessage());
}
