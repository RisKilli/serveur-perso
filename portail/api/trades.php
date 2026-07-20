<?php
require_once __DIR__ . '/../notes/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Vous devez être connecté.'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        jsonResponse([
            'success' => false,
            'message' => 'Données JSON invalides.'
        ], 400);
    }

    return $data;
}

function nullableNumber($value) {
    if ($value === null || $value === '') {
        return null;
    }

    return is_numeric($value) ? $value : null;
}

function formatDateForSql($value) {
    if (!$value) {
        return date('Y-m-d H:i:s');
    }

    // Transforme 2026-07-20T14:30 en 2026-07-20 14:30:00
    return str_replace('T', ' ', $value) . ':00';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            asset,
            direction,
            entry_price AS entryPrice,
            stop_loss AS stopLoss,
            take_profit AS takeProfit,
            result,
            strategy,
            screenshot_path AS screenshotUrl,
            emotions,
            mistake,
            lesson,
            traded_at AS tradedAt
        FROM trades
        WHERE user_id = ?
        ORDER BY traded_at DESC, id DESC
    ");

    $stmt->execute([$userId]);
    $trades = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'trades' => $trades
    ]);
}

if ($method === 'POST') {
    $data = getJsonInput();

    $asset = trim($data['asset'] ?? '');
    $direction = $data['direction'] ?? '';
    $entryPrice = $data['entryPrice'] ?? null;

    if ($asset === '' || !in_array($direction, ['buy', 'sell'], true) || !is_numeric($entryPrice)) {
        jsonResponse([
            'success' => false,
            'message' => 'Actif, sens ou prix d’entrée invalide.'
        ], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO trades (
            user_id,
            asset,
            direction,
            entry_price,
            stop_loss,
            take_profit,
            result,
            strategy,
            screenshot_path,
            emotions,
            mistake,
            lesson,
            traded_at
        ) VALUES (
            :user_id,
            :asset,
            :direction,
            :entry_price,
            :stop_loss,
            :take_profit,
            :result,
            :strategy,
            :screenshot_path,
            :emotions,
            :mistake,
            :lesson,
            :traded_at
        )
    ");

    $stmt->execute([
        ':user_id' => $userId,
        ':asset' => $asset,
        ':direction' => $direction,
        ':entry_price' => $entryPrice,
        ':stop_loss' => nullableNumber($data['stopLoss'] ?? null),
        ':take_profit' => nullableNumber($data['takeProfit'] ?? null),
        ':result' => nullableNumber($data['result'] ?? null),
        ':strategy' => trim($data['strategy'] ?? ''),
        ':screenshot_path' => null,
        ':emotions' => trim($data['emotions'] ?? ''),
        ':mistake' => trim($data['mistake'] ?? ''),
        ':lesson' => trim($data['lesson'] ?? ''),
        ':traded_at' => formatDateForSql($data['tradedAt'] ?? null)
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Trade enregistré.',
        'id' => $pdo->lastInsertId()
    ], 201);
}

jsonResponse([
    'success' => false,
    'message' => 'Méthode non autorisée.'
], 405);
