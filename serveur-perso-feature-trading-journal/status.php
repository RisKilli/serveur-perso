<?php

date_default_timezone_set('Europe/Paris');

function formatBytes($bytes) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;

    while ($bytes >= 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }

    return round($bytes, 2) . ' ' . $units[$i];
}

function getUptime() {
    if (!file_exists('/proc/uptime')) {
        return 'Indisponible';
    }

    $uptime = explode(' ', file_get_contents('/proc/uptime'))[0];
    $seconds = (int) $uptime;

    $days = floor($seconds / 86400);
    $hours = floor(($seconds % 86400) / 3600);
    $minutes = floor(($seconds % 3600) / 60);

    return "{$days}j {$hours}h {$minutes}min";
}

function getRamInfo() {
    if (!file_exists('/proc/meminfo')) {
        return null;
    }

    $meminfo = file('/proc/meminfo');
    $data = [];

    foreach ($meminfo as $line) {
        [$key, $value] = explode(':', $line);
        $data[$key] = (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    $total = $data['MemTotal'] * 1024;
    $available = $data['MemAvailable'] * 1024;
    $used = $total - $available;
    $percent = round(($used / $total) * 100);

    return [
        'total' => $total,
        'used' => $used,
        'available' => $available,
        'percent' => $percent
    ];
}

$hostname = gethostname();
$date = date('d/m/Y H:i:s');
$phpVersion = phpversion();
$uptime = getUptime();

$load = sys_getloadavg();
$loadAverage = $load ? round($load[0], 2) : 'Indisponible';

$diskTotal = disk_total_space('/');
$diskFree = disk_free_space('/');
$diskUsed = $diskTotal - $diskFree;
$diskPercent = round(($diskUsed / $diskTotal) * 100);

$ram = getRamInfo();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Statut du serveur</title>
    <meta http-equiv="refresh" content="10">
    <link rel="stylesheet" href="assets/css/style.css">

    <style>
        .status-container {
            max-width: 1100px;
            margin: 40px auto;
            padding: 0 25px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
        }

        .status-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 25px;
        }

        .status-card h2 {
            margin-top: 0;
            color: #38bdf8;
        }

        .status-value {
            font-size: 24px;
            font-weight: bold;
        }

        .progress {
            width: 100%;
            height: 12px;
            background: #334155;
            border-radius: 999px;
            overflow: hidden;
            margin-top: 12px;
        }

        .progress-bar {
            height: 100%;
            background: #38bdf8;
        }

        .online {
            color: #4ade80;
            font-weight: bold;
        }

        .back-link {
            display: block;
            text-align: center;
            margin: 30px;
            color: #38bdf8;
            font-weight: bold;
        }
    </style>
</head>

<body>

<header class="hero">
    <nav class="navbar">
        <h2>GegeServer</h2>
        <div>
            <a href="index.html">Accueil</a>
            <a href="projets.html">Projets</a>
            <a href="trading.html">Trading</a>
            <a href="notes.html">Notes</a>
            <a href="status.php">Statut</a>
        </div>
    </nav>

    <section class="hero-content">
        <p class="badge">Statut en direct</p>
        <h1>Statut du serveur</h1>
        <p>Cette page est générée en PHP et se met à jour automatiquement toutes les 10 secondes.</p>
    </section>
</header>

<main class="status-container">

    <div class="status-card">
        <h2>Serveur</h2>
        <p>Nom de la machine :</p>
        <p class="status-value"><?= htmlspecialchars($hostname) ?></p>
    </div>

    <div class="status-card">
        <h2>Services</h2>
        <p>Nginx : <span class="online">en ligne</span></p>
        <p>PHP-FPM : <span class="online">fonctionnel</span></p>
    </div>

    <div class="status-card">
        <h2>Heure serveur</h2>
        <p class="status-value"><?= $date ?></p>
    </div>

    <div class="status-card">
        <h2>PHP</h2>
        <p>Version installée :</p>
        <p class="status-value"><?= htmlspecialchars($phpVersion) ?></p>
    </div>

    <div class="status-card">
        <h2>Uptime</h2>
        <p>Temps depuis le dernier démarrage :</p>
        <p class="status-value"><?= $uptime ?></p>
    </div>

    <div class="status-card">
        <h2>Charge CPU</h2>
        <p>Charge moyenne :</p>
        <p class="status-value"><?= $loadAverage ?></p>
    </div>

    <?php if ($ram): ?>
    <div class="status-card">
        <h2>RAM</h2>
        <p><?= formatBytes($ram['used']) ?> utilisés sur <?= formatBytes($ram['total']) ?></p>
        <p class="status-value"><?= $ram['percent'] ?>%</p>
        <div class="progress">
            <div class="progress-bar" style="width: <?= $ram['percent'] ?>%;"></div>
        </div>
    </div>
    <?php endif; ?>

    <div class="status-card">
        <h2>Disque</h2>
        <p><?= formatBytes($diskUsed) ?> utilisés sur <?= formatBytes($diskTotal) ?></p>
        <p class="status-value"><?= $diskPercent ?>%</p>
        <div class="progress">
            <div class="progress-bar" style="width: <?= $diskPercent ?>%;"></div>
        </div>
    </div>

</main>

<a class="back-link" href="index.html">← Retour à l’accueil</a>

<footer>
    <p>Serveur Debian + Nginx + PHP</p>
</footer>

</body>
</html>