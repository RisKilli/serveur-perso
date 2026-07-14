-- Journal de trading : migration pour une base de données déjà existante.
-- Ce fichier peut être exécuté sans risque une seconde fois :
-- la table est créée seulement si elle n'existe pas encore.

USE noting_app;

CREATE TABLE IF NOT EXISTS trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    asset VARCHAR(100) NOT NULL,
    direction ENUM('buy', 'sell') NOT NULL,
    entry_price DECIMAL(15, 8) NOT NULL,
    stop_loss DECIMAL(15, 8) NULL,
    take_profit DECIMAL(15, 8) NULL,
    result DECIMAL(12, 2) NULL,
    strategy VARCHAR(255) NULL,
    screenshot_path VARCHAR(255) NULL,
    emotions TEXT NULL,
    mistake TEXT NULL,
    lesson TEXT NULL,
    traded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trades_user_id (user_id),
    INDEX idx_trades_traded_at (traded_at)
);
