<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../../config/database.php';

// 1. Ensure table exists
$pdo->exec("CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10) DEFAULT '📦',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// 2. Default hardcoded categories
$defaults = [
    ['id' => 0, 'name' => 'Electronics', 'icon' => '💻', 'description' => 'Phones, laptops, gadgets'],
    ['id' => 0, 'name' => 'Fashion', 'icon' => '👕', 'description' => 'Clothing, shoes, accessories'],
    ['id' => 0, 'name' => 'Furniture', 'icon' => '🛋️', 'description' => 'Home & office furniture'],
    ['id' => 0, 'name' => 'Books', 'icon' => '📚', 'description' => 'Books, magazines, comics'],
    ['id' => 0, 'name' => 'Toys', 'icon' => '🧸', 'description' => 'Toys & games'],
    ['id' => 0, 'name' => 'Other', 'icon' => '📦', 'description' => 'Everything else']
];

try {
    // 3. Get custom categories from database
    $stmt = $pdo->query("SELECT id, name, icon, description FROM categories ORDER BY name ASC");
    $dbCategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Merge defaults + database categories without duplicating
    $existingNames = array_map(fn($c) => strtolower($c['name']), $dbCategories);
    $merged = $dbCategories;

    foreach ($defaults as $def) {
        if (!in_array(strtolower($def['name']), $existingNames)) {
            $merged[] = $def;
        }
    }

    // Standard json wrapper output
    if (function_exists('ok')) {
        ok(['categories' => $merged]);
    } else {
        echo json_encode(['success' => true, 'data' => ['categories' => $merged]]);
    }
} catch (Exception $e) {
    if (function_exists('fail')) {
        fail($e->getMessage());
    } else {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}