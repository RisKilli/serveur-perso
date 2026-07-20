document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tradeForm');
    const tradesList = document.getElementById('tradesList');
    const totalTrades = document.getElementById('totalTrades');
    const winningTrades = document.getElementById('winningTrades');
    const totalResult = document.getElementById('totalResult');
    const assetFilter = document.getElementById('assetFilter');
    const directionFilter = document.getElementById('directionFilter');
    const resultFilter = document.getElementById('resultFilter');
    const tradedAt = document.getElementById('tradedAt');

    let trades = [];

    function setCurrentTradeDate() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        tradedAt.value = now.toISOString().slice(0, 16);
    }

    function formatEuro(value) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(Number(value || 0));
    }

    function formatTradeDate(value) {
        return new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(value));
    }

    function getResultState(result) {
        if (result === null || result === undefined || result === '') {
            return 'pending';
        }

        return Number(result) >= 0 ? 'gain' : 'loss';
    }

    function updateSummary() {
        const gains = trades.filter((trade) => trade.result !== null && Number(trade.result) > 0);
        const total = trades.reduce((sum, trade) => sum + Number(trade.result || 0), 0);

        totalTrades.textContent = trades.length;
        winningTrades.textContent = gains.length;
        totalResult.textContent = formatEuro(total);
        totalResult.className = total < 0 ? 'negative-result' : 'positive-result';
    }

    function createEmptyState(message = 'Ajoutez votre premier trade avec le formulaire.') {
        const container = document.createElement('div');
        container.className = 'empty-trades';

        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '';

        const title = document.createElement('h3');
        title.textContent = 'Votre journal est prêt';

        const text = document.createElement('p');
        text.textContent = message;

        container.append(icon, title, text);
        return container;
    }

    function renderTrades() {
        const assetSearch = assetFilter.value.trim().toLowerCase();
        const direction = directionFilter.value;
        const result = resultFilter.value;

        const filteredTrades = trades.filter((trade) => {
            const matchesAsset = trade.asset.toLowerCase().includes(assetSearch);
            const matchesDirection = !direction || trade.direction === direction;
            const matchesResult = !result || getResultState(trade.result) === result;

            return matchesAsset && matchesDirection && matchesResult;
        });

        tradesList.replaceChildren();

        if (filteredTrades.length === 0) {
            const message = trades.length === 0
                ? 'Ajoutez votre premier trade avec le formulaire.'
                : 'Aucun trade ne correspond à ces filtres.';

            tradesList.append(createEmptyState(message));
            return;
        }

        filteredTrades.forEach((trade) => {
            const item = document.createElement('article');
            item.className = 'trade-item';

            const header = document.createElement('div');
            header.className = 'trade-item-header';

            const title = document.createElement('h3');
            title.textContent = trade.asset;

            const directionBadge = document.createElement('span');
            directionBadge.className = `trade-badge ${trade.direction}`;
            directionBadge.textContent = trade.direction === 'buy' ? 'Achat' : 'Vente';

            header.append(title, directionBadge);

            const meta = document.createElement('div');
            meta.className = 'trade-item-meta';

            const price = document.createElement('span');
            price.textContent = `Entrée : ${trade.entryPrice}`;

            const resultBadge = document.createElement('strong');
            const resultState = getResultState(trade.result);
            resultBadge.className = `result-badge ${resultState}`;
            resultBadge.textContent = resultState === 'pending'
                ? 'Résultat à renseigner'
                : formatEuro(trade.result);

            meta.append(price, resultBadge);

            const date = document.createElement('p');
            date.className = 'trade-item-strategy';
            date.textContent = formatTradeDate(trade.tradedAt);

            item.append(header, meta, date);

            if (trade.strategy) {
                const strategy = document.createElement('p');
                strategy.className = 'trade-item-strategy';
                strategy.textContent = `Stratégie : ${trade.strategy}`;
                item.append(strategy);
            }

            if (trade.emotions) {
                const emotions = document.createElement('p');
                emotions.className = 'trade-item-strategy';
                emotions.textContent = `Émotions : ${trade.emotions}`;
                item.append(emotions);
            }

            if (trade.mistake) {
                const mistake = document.createElement('p');
                mistake.className = 'trade-item-strategy';
                mistake.textContent = `Erreur : ${trade.mistake}`;
                item.append(mistake);
            }

            if (trade.lesson) {
                const lesson = document.createElement('p');
                lesson.className = 'trade-item-strategy';
                lesson.textContent = `Leçon : ${trade.lesson}`;
                item.append(lesson);
            }

            tradesList.append(item);
        });
    }

    async function loadTrades() {
        try {
            const response = await fetch('api/trades.php');
            const data = await response.json();

            if (!response.ok || !data.success) {
                tradesList.replaceChildren();
                tradesList.append(createEmptyState(data.message || 'Impossible de charger les trades.'));
                return;
            }

            trades = data.trades;
            updateSummary();
            renderTrades();
        } catch (error) {
            tradesList.replaceChildren();
            tradesList.append(createEmptyState('Erreur lors du chargement des trades.'));
        }
    }

    async function saveTrade(trade) {
        const response = await fetch('api/trades.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trade)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Erreur lors de l’enregistrement.');
        }

        return data;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const resultValue = String(formData.get('result')).trim();

        const trade = {
            asset: String(formData.get('asset')).trim(),
            direction: String(formData.get('direction')),
            entryPrice: Number(formData.get('entryPrice')),
            stopLoss: formData.get('stopLoss') ? Number(formData.get('stopLoss')) : null,
            takeProfit: formData.get('takeProfit') ? Number(formData.get('takeProfit')) : null,
            result: resultValue === '' ? null : Number(resultValue),
            strategy: String(formData.get('strategy')).trim(),
            emotions: String(formData.get('emotions')).trim(),
            mistake: String(formData.get('mistake')).trim(),
            lesson: String(formData.get('lesson')).trim(),
            tradedAt: String(formData.get('tradedAt'))
        };

        try {
            await saveTrade(trade);
            form.reset();
            setCurrentTradeDate();
            await loadTrades();
        } catch (error) {
            alert(error.message);
        }
    });

    form.addEventListener('reset', () => {
        window.setTimeout(setCurrentTradeDate, 0);
    });

    [assetFilter, directionFilter, resultFilter].forEach((filter) => {
        filter.addEventListener('input', renderTrades);
        filter.addEventListener('change', renderTrades);
    });

    setCurrentTradeDate();
    loadTrades();
});