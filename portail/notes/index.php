<?php
require_once 'config.php';
requireLogin();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application de Notes</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <h1><i class="fas fa-sticky-note"></i> Mes Notes</h1>
                <span class="user-info">Connecté en tant que : <?php echo htmlspecialchars($_SESSION['username']); ?></span>
            </div>
            <div class="header-right">
                <form id="avatarForm" enctype="multipart/form-data" style="display:flex; align-items:center; gap:0.5rem;">
                    <label for="avatarInput" style="cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
                        <img id="userAvatar" src="<?php echo isset($_SESSION['avatar']) ? htmlspecialchars($_SESSION['avatar']) : 'https://ui-avatars.com/api/?name=' . urlencode($_SESSION['username']); ?>" alt="Avatar" class="avatar-img">
                        <input type="file" id="avatarInput" name="avatar" accept="image/*" style="display:none;" />
                    </label>
                </form>
                <button id="newNoteBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Nouvelle Note
                </button>
                <a href="logout.php" class="btn btn-secondary">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </a>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Rechercher une note..." class="search-input">
                    <i class="fas fa-search search-icon"></i>
                </div>
                
                <div class="notes-list" id="notesList">
                    <!-- Les notes seront ajoutées ici dynamiquement -->
                </div>
            </aside>

            <!-- Note Editor -->
            <section class="note-editor" id="noteEditor">
                <div class="editor-header">
                    <input type="text" id="noteTitle" placeholder="Titre de la note..." class="title-input">
                    <div class="editor-actions">
                        <button id="saveNoteBtn" class="btn btn-success">
                            <i class="fas fa-save"></i> Sauvegarder
                        </button>
                        <button id="deleteNoteBtn" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                
                <div class="editor-content">
                    <textarea id="noteContent" placeholder="Commencez à écrire votre note..." class="content-textarea"></textarea>
                </div>
                
                <div class="note-info">
                    <span id="noteDate" class="note-date"></span>
                    <span id="noteWordCount" class="word-count"></span>
                </div>
            </section>
        </main>
    </div>

    <!-- Modal pour confirmation de suppression -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette note ?</p>
            <div class="modal-actions">
                <button id="confirmDelete" class="btn btn-danger">Supprimer</button>
                <button id="cancelDelete" class="btn btn-secondary">Annuler</button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
    <script>
        // Passer l'ID de l'utilisateur au JavaScript
        window.currentUserId = <?php echo $_SESSION['user_id']; ?>;
    </script>
</body>
</html> 