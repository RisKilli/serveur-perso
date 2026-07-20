# Application de Notes avec Authentification

Une application de notes moderne et sécurisée développée en PHP, MySQL, HTML, CSS et JavaScript.

## 🚀 Fonctionnalités

- **Authentification complète** : Inscription, connexion et déconnexion
- **Sécurité** : Mots de passe hashés, protection contre les injections SQL
- **Base de données MySQL** : Stockage persistant des notes
- **Interface moderne** : Design épuré avec des animations fluides
- **Gestion complète des notes** : Créer, éditer, sauvegarder et supprimer des notes
- **Recherche en temps réel** : Trouvez rapidement vos notes
- **API REST** : Communication sécurisée entre le frontend et la base de données
- **Compteur de mots** : Suivez la longueur de vos notes
- **Responsive design** : Fonctionne sur tous les appareils
- **Raccourcis clavier** : Navigation rapide avec le clavier

## 🎯 Fonctionnalités principales

### 🔐 Authentification
- **Inscription** : Créer un nouveau compte avec validation
- **Connexion** : Se connecter avec nom d'utilisateur/email et mot de passe
- **Déconnexion** : Fermer la session en toute sécurité
- **Sessions sécurisées** : Protection des données utilisateur

### 📝 Gestion des notes
- Créer une nouvelle note avec le bouton "Nouvelle Note"
- Éditer le titre et le contenu de vos notes
- Sauvegarder automatiquement vos modifications
- Supprimer des notes avec confirmation
- Chaque utilisateur voit uniquement ses propres notes

### 🔍 Recherche
- Barre de recherche en temps réel
- Recherche dans les titres et le contenu des notes
- Filtrage instantané des résultats

### 💾 Base de données
- Stockage MySQL sécurisé
- Persistance des données entre les sessions
- Sauvegarde automatique lors de la modification
- Protection contre les injections SQL

### ⌨️ Raccourcis clavier
- `Ctrl/Cmd + N` : Nouvelle note
- `Ctrl/Cmd + S` : Sauvegarder la note actuelle

## 🛠️ Installation et configuration

### Prérequis
- Serveur web (Apache/Nginx)
- PHP 7.4 ou supérieur
- MySQL 5.7 ou supérieur
- Extension PHP PDO

### Installation

1. **Cloner ou télécharger** les fichiers dans votre répertoire web
2. **Configurer la base de données** :
   ```sql
   -- Importer le fichier database.sql dans phpMyAdmin
   -- Ou exécuter les commandes SQL manuellement
   ```

3. **Configurer la connexion** :
   - Modifier `config.php` avec vos paramètres de base de données
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'noting_app');
   define('DB_USER', 'votre_utilisateur');
   define('DB_PASS', 'votre_mot_de_passe');
   ```

4. **Accéder à l'application** :
   - Ouvrir `login.php` dans votre navigateur
   - Créer un nouveau compte ou se connecter

## 📁 Structure des fichiers

```
Noting_App/
├── config.php           # Configuration de la base de données
├── database.sql         # Script de création de la base de données
├── login.php            # Page de connexion
├── register.php         # Page d'inscription
├── logout.php           # Script de déconnexion
├── api.php              # API REST pour les notes
├── index.html           # Page principale de l'application
├── styles.css           # Styles CSS pour l'interface
├── script.js            # Logique JavaScript de l'application
└── README.md            # Documentation
```

## 🗄️ Structure de la base de données

### Table `users`
- `id` : Identifiant unique
- `username` : Nom d'utilisateur (unique)
- `email` : Adresse email (unique)
- `password` : Mot de passe hashé
- `created_at` : Date de création
- `updated_at` : Date de modification

### Table `notes`
- `id` : Identifiant unique
- `user_id` : Référence vers l'utilisateur
- `title` : Titre de la note
- `content` : Contenu de la note
- `created_at` : Date de création
- `updated_at` : Date de modification

## 🔧 Technologies utilisées

- **PHP 7.4+** : Backend et logique métier
- **MySQL** : Base de données
- **PDO** : Interface de base de données sécurisée
- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec Flexbox et animations
- **JavaScript ES6+** : Logique de l'application côté client
- **Fetch API** : Communication avec l'API REST
- **Font Awesome** : Icônes

## 🔒 Sécurité

- **Mots de passe hashés** avec `password_hash()`
- **Protection contre les injections SQL** avec PDO et requêtes préparées
- **Validation des données** côté serveur et client
- **Sessions sécurisées** avec vérification d'authentification
- **Sanitisation des données** avant affichage
- **Contrôle d'accès** : chaque utilisateur ne voit que ses notes

## 📱 Compatibilité

- ✅ Chrome (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🚀 Fonctionnalités avancées

### Gestion intelligente des notes
- Suppression automatique des notes vides
- Prévisualisation du contenu dans la liste
- Formatage intelligent des dates

### Interface utilisateur
- États vides avec messages informatifs
- Notifications de sauvegarde et d'erreur
- Modal de confirmation pour les suppressions
- Indicateurs visuels pour la note active

### Performance
- Rendu optimisé des listes
- Gestion efficace de la mémoire
- Animations fluides
- Requêtes SQL optimisées

## 🤝 Contribution

Ce projet est open source. N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Contribuer au code

## 📄 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

**Développé avec ❤️ pour une expérience de prise de notes sécurisée et optimale** 