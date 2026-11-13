<?php
require_once '../../config/database.php';
$cat = $_GET['category'] ?? '';
$q = $_GET['search'] ?? '';
$free = isset($_GET['free']) ? (int)$_GET['free'] : 0;
$minP = (float)($_GET['min_price'] ?? 0);
$maxP = (float)($_GET['max_price'] ?? 0);
$sort = $_GET['sort'] ?? 'new';
$cond = $_GET['condition'] ?? '';

$sql = "SELECT p.*, u.name AS seller_name, u.avatar_initial AS seller_avatar,
        u.level AS seller_level, u.mottainai_points AS seller_points
        FROM products p JOIN users u ON p.user_id = u.id WHERE 1=1";
$params = [];
if ($cat && $cat !== 'All') { $sql .= " AND p.category = ?"; $params[] = $cat; }
if ($q) { $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)"; $params[] = "%$q%"; $params[] = "%$q%"; }
if ($free) $sql .= " AND p.is_free = 1";
if ($minP > 0) { $sql .= " AND p.price >= ?"; $params[] = $minP; }
if ($maxP > 0) { $sql .= " AND p.price <= ?"; $params[] = $maxP; }
if ($cond) { $sql .= " AND p.condition_label = ?"; $params[] = $cond; }
switch ($sort) {
    case 'price_low': $sql .= " ORDER BY p.price ASC"; break;
    case 'price_high': $sql .= " ORDER BY p.price DESC"; break;
    case 'rating': $sql .= " ORDER BY p.rating_avg DESC"; break;
    case 'popular': $sql .= " ORDER BY p.views DESC"; break;
    default: $sql .= " ORDER BY p.created_at DESC";
}
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();
foreach ($rows as &$r) {
    $r['images'] = $r['images'] ? json_decode($r['images'], true) : [];
    $r['main_image'] = !empty($r['images'][0]) ? $r['images'][0] : '';
}
ok(['products' => $rows]);
