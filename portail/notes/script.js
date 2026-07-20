// Classe principale de l'application de notes
class NotesApp {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        this.isEditing = false;
        this.currentUserId = window.currentUserId || 1;
        
        this.initElements();
        this.bindEvents();
        this.loadNotes().then(() => {
            this.renderNotesList();
            if (this.notes.length === 0) {
                this.showEmptyState();
            }
        });
    }

    // Initialisation des éléments DOM
    initElements() {
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.notesList = document.getElementById('notesList');
        this.noteEditor = document.getElementById('noteEditor');
        this.noteTitle = document.getElementById('noteTitle');
        this.noteContent = document.getElementById('noteContent');
        this.saveNoteBtn = document.getElementById('saveNoteBtn');
        this.deleteNoteBtn = document.getElementById('deleteNoteBtn');
        this.searchInput = document.getElementById('searchInput');
        this.noteDate = document.getElementById('noteDate');
        this.noteWordCount = document.getElementById('noteWordCount');
        this.deleteModal = document.getElementById('deleteModal');
        this.confirmDelete = document.getElementById('confirmDelete');
        this.cancelDelete = document.getElementById('cancelDelete');
    }

    // Liaison des événements
    bindEvents() {
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        this.saveNoteBtn.addEventListener('click', () => this.saveCurrentNote());
        this.deleteNoteBtn.addEventListener('click', () => this.showDeleteModal());
        this.searchInput.addEventListener('input', (e) => this.filterNotes(e.target.value));
        
        // Événements pour le modal de suppression
        this.confirmDelete.addEventListener('click', () => this.deleteCurrentNote());
        this.cancelDelete.addEventListener('click', () => this.hideDeleteModal());
        
        // Fermer le modal en cliquant à l'extérieur
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.hideDeleteModal();
            }
        });

        // Sauvegarde automatique lors de la saisie
        this.noteTitle.addEventListener('input', () => this.updateWordCount());
        this.noteContent.addEventListener('input', () => this.updateWordCount());

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentNote();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.createNewNote();
                        break;
                }
            }
        });
    }

    // Créer une nouvelle note
    async createNewNote() {
        const newNote = {
            title: '',
            content: ''
        };

        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote)
            });

            const result = await response.json();
            
            if (result.success) {
                this.notes.unshift(result.note);
                this.currentNoteId = result.note.id;
                this.isEditing = true;
                
                this.renderNotesList();
                this.loadNoteIntoEditor(result.note);
                
                // Focus sur le titre
                setTimeout(() => {
                    this.noteTitle.focus();
                }, 100);
            } else {
                this.showErrorNotification(result.error || 'Erreur lors de la création de la note');
            }
        } catch (error) {
            this.showErrorNotification('Erreur de connexion');
        }
    }

    // Charger une note dans l'éditeur
    loadNoteIntoEditor(note) {
        // S'assurer que l'éditeur est restauré
        this.restoreEditor();
        
        this.noteTitle.value = note.title;
        this.noteContent.value = note.content;
        this.updateWordCount();
        this.updateNoteDate(note.updated_at);
        
        // Mettre à jour l'état actif dans la liste
        this.updateActiveNoteInList();
    }

    // Sauvegarder la note actuelle
    async saveCurrentNote() {
        if (!this.currentNoteId) return;

        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value.trim();

        // Si la note est vide, la supprimer
        if (!title && !content) {
            this.deleteCurrentNote();
            return;
        }

        try {
            const response = await fetch('api.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: this.currentNoteId,
                    title: title || 'Note sans titre',
                    content: content
                })
            });

            const result = await response.json();
            
            if (result.success) {
                const noteIndex = this.notes.findIndex(note => note.id === this.currentNoteId);
                if (noteIndex !== -1) {
                    this.notes[noteIndex] = result.note;
                }
                
                this.renderNotesList();
                this.updateWordCount();
                this.updateNoteDate(result.note.updated_at);
                
                // Afficher une notification de sauvegarde
                this.showSaveNotification();
            } else {
                this.showErrorNotification(result.error || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            this.showErrorNotification('Erreur de connexion');
        }
    }

    // Supprimer la note actuelle
    async deleteCurrentNote() {
        if (!this.currentNoteId) return;

        try {
            const response = await fetch('api.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: this.currentNoteId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.notes = this.notes.filter(note => note.id !== this.currentNoteId);
                this.renderNotesList();
                this.clearEditor();
                this.hideDeleteModal();
                
                // Sélectionner la première note disponible ou créer une nouvelle
                if (this.notes.length > 0) {
                    this.selectNote(this.notes[0].id);
                } else {
                    this.showEmptyState();
                }
            } else {
                this.showErrorNotification(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            this.showErrorNotification('Erreur de connexion');
        }
    }

    // Sélectionner une note
    selectNote(noteId) {
        this.currentNoteId = noteId;
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.loadNoteIntoEditor(note);
        }
    }

    // Filtrer les notes
    filterNotes(searchTerm) {
        const noteItems = this.notesList.querySelectorAll('.note-item');
        const term = searchTerm.toLowerCase();

        noteItems.forEach(item => {
            const title = item.querySelector('.note-item-title').textContent.toLowerCase();
            const preview = item.querySelector('.note-item-preview').textContent.toLowerCase();
            
            if (title.includes(term) || preview.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Rendu de la liste des notes
    renderNotesList() {
        this.notesList.innerHTML = '';

        if (this.notes.length === 0) {
            this.showEmptyState();
            return;
        }

        this.notes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesList.appendChild(noteElement);
        });
        
        // Si aucune note n'est sélectionnée mais qu'il y a des notes, sélectionner la première
        if (!this.currentNoteId && this.notes.length > 0) {
            this.selectNote(this.notes[0].id);
        }
    }

    // Créer un élément de note
    createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.dataset.noteId = note.id;
        
        if (note.id === this.currentNoteId) {
            noteElement.classList.add('active');
        }

        const preview = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
        const createdDate = this.formatDate(note.created_at);
        const updatedDate = this.formatDate(note.updated_at);

        noteElement.innerHTML = `
            <div class="note-item-title">${note.title || 'Note sans titre'}</div>
            <div class="note-item-preview">${preview || 'Aucun contenu'}</div>
            <div class="note-item-dates">
                <div class="note-item-created"><i class="fas fa-calendar-plus"></i> Créée le ${createdDate}</div>
                <div class="note-item-updated"><i class="fas fa-edit"></i> Modifiée le ${updatedDate}</div>
            </div>
        `;

        noteElement.addEventListener('click', () => {
            this.selectNote(note.id);
            this.updateActiveNoteInList();
        });

        return noteElement;
    }

    // Mettre à jour la note active dans la liste
    updateActiveNoteInList() {
        const noteItems = this.notesList.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.noteId === this.currentNoteId) {
                item.classList.add('active');
            }
        });
    }

    // Vider l'éditeur
    clearEditor() {
        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.currentNoteId = null;
        this.updateWordCount();
        this.noteDate.innerHTML = '';
    }

    // Restaurer l'éditeur
    restoreEditor() {
        // Vérifier si l'éditeur a la structure HTML complète
        if (!this.noteEditor.querySelector('.editor-header')) {
            // Restaurer la structure HTML de l'éditeur
            this.noteEditor.innerHTML = `
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
                    <div id="noteDate"></div>
                    <span id="noteWordCount" class="word-count"></span>
                </div>
            `;
            
            // Réinitialiser les références aux éléments
            this.initElements();
        }
    }

    // Afficher l'état vide
    showEmptyState() {
        // Afficher le message d'état vide
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-sticky-note"></i>
            <h3>Aucune note</h3>
            <p>Cliquez sur "Nouvelle Note" pour commencer</p>
        `;
        
        // Remplacer le contenu de l'éditeur par l'état vide
        this.noteEditor.innerHTML = '';
        this.noteEditor.appendChild(emptyState);
    }

    // Mettre à jour le compteur de mots
    updateWordCount() {
        const content = this.noteContent.value;
        const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        const charCount = content.length;
        
        this.noteWordCount.textContent = `${wordCount} mots, ${charCount} caractères`;
    }

    // Mettre à jour la date de la note
    updateNoteDate(dateString) {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            const createdDate = this.formatDate(note.created_at);
            const updatedDate = this.formatDate(dateString);
            this.noteDate.innerHTML = `
                <div class="date-info">
                    <span class="created-date"><i class="fas fa-calendar-plus"></i> Créée le ${createdDate}</span>
                    <span class="updated-date"><i class="fas fa-edit"></i> Modifiée le ${updatedDate}</span>
                </div>
            `;
        }
    }

    // Formater une date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            if (diffInHours < 1) {
                const diffInMinutes = Math.floor((now - date) / (1000 * 60));
                return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
            }
            return `Il y a ${Math.floor(diffInHours)} heure${Math.floor(diffInHours) > 1 ? 's' : ''}`;
        } else if (diffInHours < 48) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    // Afficher la notification de sauvegarde
    showSaveNotification() {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = 'Note sauvegardée !';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Afficher le modal de suppression
    showDeleteModal() {
        if (!this.currentNoteId) return;
        this.deleteModal.style.display = 'block';
    }

    // Masquer le modal de suppression
    hideDeleteModal() {
        this.deleteModal.style.display = 'none';
    }

    // Afficher la notification d'erreur
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(245, 101, 101, 0.4);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Charger les notes depuis la base de données
    async loadNotes() {
        try {
            const response = await fetch('api.php');
            const result = await response.json();
            
            if (result.success) {
                this.notes = result.notes;
            } else {
                this.showErrorNotification(result.error || 'Erreur lors du chargement des notes');
            }
        } catch (error) {
            this.showErrorNotification('Erreur de connexion');
        }
    }
}

// Styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const app = new NotesApp();
    // Upload avatar (UI minimal, pas d'interférence avec NotesApp)
    const avatarInput = document.getElementById('avatarInput');
    const avatarImg = document.getElementById('userAvatar');
    if (avatarInput && avatarImg) {
        avatarInput.addEventListener('change', async () => {
            if (!avatarInput.files || avatarInput.files.length === 0) return;
            const file = avatarInput.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert('Image trop volumineuse (max 2MB)');
                return;
            }
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const res = await fetch('api.php?action=upload_avatar', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                if (result.success && result.avatar) {
                    avatarImg.src = result.avatar + '?t=' + Date.now();
                } else {
                    alert(result.error || 'Erreur lors de l\'upload');
                }
            } catch (e) {
                alert('Erreur de connexion');
            }
        });
    }
}); 