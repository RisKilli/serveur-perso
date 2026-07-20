<?php
require_once 'config.php';
requireLogin();

// Définir le type de contenu JSON
header('Content-Type: application/json');

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

try {
    if (isset($_GET['action']) && $_GET['action'] === 'upload_avatar') {
        if ($method !== 'POST') { throw new Exception('Méthode non supportée'); }
        if (!isset($_FILES['avatar'])) { throw new Exception('Fichier manquant'); }

        $file = $_FILES['avatar'];
        if ($file['error'] !== UPLOAD_ERR_OK) { throw new Exception('Erreur de téléchargement'); }

        // Validation de sécurité
        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        if (!isset($allowedTypes[$mime])) { throw new Exception('Type de fichier non autorisé'); }

        if ($file['size'] > 2 * 1024 * 1024) { throw new Exception('Fichier trop volumineux (max 2MB)'); }

        // Dossier de stockage
        $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars';
        if (!is_dir($uploadDir)) { mkdir($uploadDir, 0775, true); }

        $ext = $allowedTypes[$mime];
        $filename = 'u' . $_SESSION['user_id'] . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $destPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) { throw new Exception('Échec de l’enregistrement'); }

        // Chemin public relatif
        $publicPath = 'uploads/avatars/' . $filename;

        // Supprimer l’ancien avatar si présent
        $stmt = $pdo->prepare("SELECT avatar FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $old = $stmt->fetch();
        if ($old && !empty($old['avatar'])) {
            $oldPath = __DIR__ . DIRECTORY_SEPARATOR . $old['avatar'];
            if (is_file($oldPath)) { @unlink($oldPath); }
        }

        // Mettre à jour en base
        $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
        $stmt->execute([$publicPath, $_SESSION['user_id']]);

        echo json_encode(['success' => true, 'avatar' => $publicPath]);
        return;
    }
    switch ($method) {
        case 'GET':
            // Récupérer toutes les notes de l'utilisateur
            $stmt = $pdo->prepare("SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC");
            $stmt->execute([$_SESSION['user_id']]);
            $notes = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'notes' => $notes]);
            break;
            
        case 'POST':
            // Créer une nouvelle note
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title']) || !isset($data['content'])) {
                throw new Exception('Titre et contenu requis');
            }
            
            $title = sanitize($data['title']);
            $content = sanitize($data['content']);
            
            $stmt = $pdo->prepare("INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)");
            $stmt->execute([$_SESSION['user_id'], $title, $content]);
            
            $note_id = $pdo->lastInsertId();
            
            // Récupérer la note créée
            $stmt = $pdo->prepare("SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?");
            $stmt->execute([$note_id]);
            $note = $stmt->fetch();
            
            echo json_encode(['success' => true, 'note' => $note]);
            break;
            
        case 'PUT':
            // Mettre à jour une note existante
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['title']) || !isset($data['content'])) {
                throw new Exception('ID, titre et contenu requis');
            }
            
            $note_id = (int)$data['id'];
            $title = sanitize($data['title']);
            $content = sanitize($data['content']);
            
            // Vérifier que la note appartient à l'utilisateur
            $stmt = $pdo->prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?");
            $stmt->execute([$note_id, $_SESSION['user_id']]);
            
            if (!$stmt->fetch()) {
                throw new Exception('Note non trouvée ou accès non autorisé');
            }
            
            $stmt = $pdo->prepare("UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$title, $content, $note_id, $_SESSION['user_id']]);
            
            // Récupérer la note mise à jour
            $stmt = $pdo->prepare("SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?");
            $stmt->execute([$note_id]);
            $note = $stmt->fetch();
            
            echo json_encode(['success' => true, 'note' => $note]);
            break;
            
        case 'DELETE':
            // Supprimer une note
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('ID requis');
            }
            
            $note_id = (int)$data['id'];
            
            // Vérifier que la note appartient à l'utilisateur
            $stmt = $pdo->prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?");
            $stmt->execute([$note_id, $_SESSION['user_id']]);
            
            if (!$stmt->fetch()) {
                throw new Exception('Note non trouvée ou accès non autorisé');
            }
            
            $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ? AND user_id = ?");
            $stmt->execute([$note_id, $_SESSION['user_id']]);
            
            echo json_encode(['success' => true, 'message' => 'Note supprimée']);
            break;
            
        default:
            throw new Exception('Méthode non supportée');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?> 