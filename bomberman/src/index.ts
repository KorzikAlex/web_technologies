import { EventsManager, GameManager, MapManager, RecordsManager } from '@/managers';
import type { Entity, IDrawable } from '@/entities';

import '@/styles/style.scss';

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled = false;
    }
    return ctx;
}

function setAsideToggleButton(): void {
    const toggleBtn: HTMLButtonElement | null = document.getElementById(
        'toggleSidebarBtn',
    ) as HTMLButtonElement;
    const sidebarEl: HTMLDivElement | null = document.getElementById('sidebar') as HTMLDivElement;
    if (toggleBtn && sidebarEl) {
        const hidden = localStorage.getItem('sidebarHidden') === '1';
        if (hidden) {
            sidebarEl.classList.add('sidebar--hidden');
        }
        toggleBtn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
        toggleBtn.addEventListener('click', () => {
            const isHidden = sidebarEl.classList.toggle('sidebar--hidden');
            localStorage.setItem('sidebarHidden', isHidden ? '1' : '0');
            toggleBtn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
        });
    }
}

function setupThemeSwitcher(): void {
    const themeRadios = document.querySelectorAll<HTMLInputElement>('input[name="theme"]');
    const body = document.body;

    // Получить системную тему
    const getSystemTheme = (): 'light' | 'dark' => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Применить тему
    const applyTheme = (theme: 'system' | 'light' | 'dark'): void => {
        const actualTheme = theme === 'system' ? getSystemTheme() : theme;
        if (actualTheme === 'dark') {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }
    };

    // Загрузить сохранённую тему
    const savedTheme = (localStorage.getItem('theme') as 'system' | 'light' | 'dark') || 'system';
    applyTheme(savedTheme);

    // Установить активный радио-баттон
    themeRadios.forEach((radio) => {
        if (radio.value === savedTheme) {
            radio.checked = true;
        }

        radio.addEventListener('change', () => {
            if (radio.checked) {
                const theme = radio.value as 'system' | 'light' | 'dark';
                localStorage.setItem('theme', theme);
                applyTheme(theme);
            }
        });
    });

    // Слушать изменения системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentTheme = localStorage.getItem('theme') || 'system';
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
}

function setPlayerInfo(): void {
    const nickEl = document.getElementById('headerPlayerNick') as HTMLElement | null;
    const scoreEl = document.getElementById('headerPlayerScore') as HTMLElement | null;
    if (!nickEl || !scoreEl) return;

    const currentPlayer = RecordsManager.getCurrentPlayer();
    if (currentPlayer) {
        nickEl.textContent = currentPlayer.nick;
        scoreEl.textContent = currentPlayer.score.toString();
    } else {
        nickEl.textContent = '-';
        scoreEl.textContent = '0';
    }
}

function updateLeaderboard(): void {
    const leaderboardEl = document.getElementById('infoPanelContent') as HTMLOListElement | null;
    if (!leaderboardEl) return;

    const leaderboard = RecordsManager.getLeaderboard(10);
    leaderboardEl.innerHTML = '';

    if (leaderboard.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.textContent = 'Нет рекордов';
        emptyMsg.style.listStyle = 'none';
        leaderboardEl.appendChild(emptyMsg);
        return;
    }

    leaderboard.forEach((player) => {
        const item = document.createElement('li');
        item.className = 'leaderboard__item';
        item.innerHTML = `
            <span class="leaderboard__nick">${player.nick}</span>
            <span class="leaderboard__score">${player.score}</span>
        `;
        leaderboardEl.appendChild(item);
    });
}

function updatePlayerSelect(): void {
    const selectEl = document.getElementById('playerSelect') as HTMLSelectElement | null;
    if (!selectEl) return;

    const players = RecordsManager.getPlayers();
    const currentPlayer = RecordsManager.getCurrentPlayer();

    selectEl.innerHTML = '';

    players.forEach((player) => {
        const option = document.createElement('option');
        option.value = player.nick;
        option.textContent = `${player.nick} (${player.score})`;
        if (currentPlayer && player.nick === currentPlayer.nick) {
            option.selected = true;
        }
        selectEl.appendChild(option);
    });
}

function setupPlayerSelectHandler(): void {
    const selectEl = document.getElementById('playerSelect') as HTMLSelectElement | null;
    if (!selectEl) return;

    selectEl.addEventListener('change', () => {
        const selectedNick = selectEl.value;
        if (selectedNick) {
            RecordsManager.setCurrentPlayer(selectedNick);
            setPlayerInfo();
            updateLeaderboard();
        }
    });
}

function refreshUI(): void {
    setPlayerInfo();
    updateLeaderboard();
    updatePlayerSelect();
}

function openPlayerModal(): void {
    const modal = document.getElementById('nickModal') as HTMLDivElement | null;
    const nickInput = document.getElementById('playerNickInput') as HTMLInputElement | null;

    if (!modal || !nickInput) return;

    // Очистить поле ввода
    nickInput.value = '';

    // Показать модальное окно
    modal.classList.remove('modal--hidden');
    nickInput.focus();

    // Обновить datalist с существующими никами
    const existingDatalist = document.getElementById('nicksDatalist');
    if (existingDatalist) {
        existingDatalist.remove();
    }

    const existingNicks = RecordsManager.getAllNicks();
    if (existingNicks.length > 0) {
        const datalist = document.createElement('datalist');
        datalist.id = 'nicksDatalist';
        existingNicks.forEach((nick) => {
            const option = document.createElement('option');
            option.value = nick;
            datalist.appendChild(option);
        });
        nickInput.setAttribute('list', 'nicksDatalist');
        nickInput.parentElement?.appendChild(datalist);
    }
}

function initGame(): void {
    const mapPaths: string[] = ['/maps/map1.json', '/maps/map2.json'];

    const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx: CanvasRenderingContext2D | null = getCanvasContext(canvas);
    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    const eventsManager: EventsManager = new EventsManager();
    const gameManager: GameManager<Entity & IDrawable> = new GameManager<Entity & IDrawable>(
        eventsManager,
    );
    const mapManager: MapManager = new MapManager(mapPaths[0], gameManager);
    gameManager.setMapManager(mapManager);

    // Игровой цикл для постоянной отрисовки
    function gameLoop(): void {
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        mapManager.draw(ctx);
        requestAnimationFrame(gameLoop);
    }

    // Запускаем игровой цикл
    gameLoop();
}

document.addEventListener('DOMContentLoaded', (): void => {
    setAsideToggleButton();
    setupThemeSwitcher();
    setupPlayerSelectHandler();

    // Modal logic: require nickname before starting
    const modal: HTMLDivElement = document.getElementById('nickModal') as HTMLDivElement;
    const nickInput: HTMLInputElement = document.getElementById(
        'playerNickInput',
    ) as HTMLInputElement;
    const startBtn: HTMLButtonElement = document.getElementById(
        'startGameBtn',
    ) as HTMLButtonElement;
    const changePlayerBtn = document.getElementById('changePlayerBtn') as HTMLButtonElement | null;

    // Обработчик кнопки "Сменить игрока"
    if (changePlayerBtn) {
        changePlayerBtn.addEventListener('click', () => {
            openPlayerModal();
        });
    }

    // Обработчик ввода ника
    if (nickInput && startBtn) {
        nickInput.addEventListener('input', (): void => {
            startBtn.disabled = nickInput.value.trim() === '';
        });

        startBtn.addEventListener('click', (): void => {
            const nick = nickInput.value.trim();
            if (!nick) {
                return;
            }
            RecordsManager.setCurrentPlayer(nick);
            refreshUI();
            if (modal) {
                modal.classList.add('modal--hidden');
            }

            // Запустить игру только если она еще не запущена
            const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
            if (canvas && !canvas.dataset.gameStarted) {
                canvas.dataset.gameStarted = 'true';
                initGame();
            }
        });
    }

    const currentPlayer = RecordsManager.getCurrentPlayer();
    if (currentPlayer) {
        // If player already exists, populate UI and start immediately
        refreshUI();
        if (modal) {
            modal.classList.add('modal--hidden');
        }
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.dataset.gameStarted = 'true';
        }
        initGame();
    } else {
        // Show modal to enter nickname
        openPlayerModal();
    }
});
