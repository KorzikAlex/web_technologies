/**
 * @file index.ts
 * @fileoverview Точка входа приложения. Инициализирует менеджеры, настраивает UI и запускает игровой цикл.
 * @author KorzikAlex
 * @module src/index
 */
import { EventsManager, GameManager, MapManager, RecordsManager } from '@/managers';
import type { Entity, IDrawable } from '@/entities';

import '@/styles/style.scss';
import type { PlayerRecord } from './managers/RecordsManager';

/**
 * Получает 2D контекст холста с отключённой сглаживанием изображений
 * @param canvas HTMLCanvasElement
 * @returns CanvasRenderingContext2D | null
 */
function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled = false;
    }
    return ctx;
}

/**
 * Настраивает кнопку для скрытия/показа боковой панели
 */
function setAsideToggleButton(): void {
    const toggleBtn: HTMLButtonElement | null = document.getElementById(
        'toggleSidebarBtn',
    ) as HTMLButtonElement;
    const sidebarEl: HTMLDivElement | null = document.getElementById('sidebar') as HTMLDivElement;
    if (toggleBtn && sidebarEl) {
        const hidden: boolean = localStorage.getItem('sidebarHidden') === '1';
        if (hidden) {
            sidebarEl.classList.add('sidebar--hidden');
        }
        toggleBtn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
        toggleBtn.addEventListener('click', (): void => {
            const isHidden: boolean = sidebarEl.classList.toggle('sidebar--hidden');
            localStorage.setItem('sidebarHidden', isHidden ? '1' : '0');
            toggleBtn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
        });
    }
}

/**
 * Настраивает переключатель темы (светлая/тёмная/системная)
 */
function setupThemeSwitcher(): void {
    const themeRadios: NodeListOf<HTMLInputElement> =
        document.querySelectorAll<HTMLInputElement>('input[name="theme"]');
    const body: HTMLElement = document.body;

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
    const savedTheme: 'system' | 'light' | 'dark' =
        (localStorage.getItem('theme') as 'system' | 'light' | 'dark') || 'system';
    applyTheme(savedTheme);

    // Установить активный радио-баттон
    themeRadios.forEach((radio: HTMLInputElement): void => {
        if (radio.value === savedTheme) {
            radio.checked = true;
        }

        radio.addEventListener('change', (): void => {
            if (radio.checked) {
                const theme: 'system' | 'light' | 'dark' = radio.value as
                    | 'system'
                    | 'light'
                    | 'dark';
                localStorage.setItem('theme', theme);
                applyTheme(theme);
            }
        });
    });

    // Слушать изменения системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (): void => {
        const currentTheme: string = localStorage.getItem('theme') || 'system';
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
}

/**
 * Устанавливает информацию о текущем игроке в header
 */
function setPlayerInfo(): void {
    const nickEl: HTMLSpanElement | null = document.getElementById(
        'headerPlayerNick',
    ) as HTMLSpanElement | null;
    const scoreEl: HTMLSpanElement | null = document.getElementById(
        'headerPlayerScore',
    ) as HTMLSpanElement | null;
    if (!nickEl || !scoreEl) {
        return;
    }

    const currentPlayer: PlayerRecord | null = RecordsManager.getCurrentPlayer();
    if (currentPlayer) {
        nickEl.textContent = currentPlayer.nick;
        scoreEl.textContent = currentPlayer.score.toString();
    } else {
        nickEl.textContent = '-';
        scoreEl.textContent = '0';
    }
}

/**
 * Обновляет отображение счёта игрока в header
 * @param score Текущий счёт игрока
 */
function updateScoreDisplay(score: number): void {
    const scoreEl: HTMLSpanElement | null = document.getElementById(
        'headerPlayerScore',
    ) as HTMLSpanElement | null;
    if (scoreEl) {
        scoreEl.textContent = score.toString();
    }
}
/**
 * Обновляет таблицу рекордов в боковой панели
 */
function updateLeaderboard(): void {
    const leaderboardEl: HTMLOListElement | null = document.getElementById(
        'infoPanelContent',
    ) as HTMLOListElement | null;
    if (!leaderboardEl) {
        return;
    }

    const leaderboard: PlayerRecord[] = RecordsManager.getLeaderboard(10);
    leaderboardEl.innerHTML = '';

    if (leaderboard.length === 0) {
        const emptyMsg: HTMLLIElement = document.createElement('li');
        emptyMsg.textContent = 'Нет рекордов';
        emptyMsg.style.listStyle = 'none';
        leaderboardEl.appendChild(emptyMsg);
        return;
    }

    leaderboard.forEach((player: PlayerRecord): void => {
        const item: HTMLLIElement = document.createElement('li');
        item.className = 'leaderboard__item';

        // Выделяем текущего игрока
        const currentPlayer: PlayerRecord | null = RecordsManager.getCurrentPlayer();
        if (currentPlayer && player.nick === currentPlayer.nick) {
            item.classList.add('leaderboard__item--current');
        }

        item.innerHTML = `
            <span class="leaderboard__nick">${player.nick}</span>
            <span class="leaderboard__score">${player.score}</span>
        `;
        leaderboardEl.appendChild(item);
    });
}

/**
 * Обновляет список выбора игрока в toolbar
 */
function updatePlayerSelect(): void {
    const selectEl: HTMLSelectElement | null = document.getElementById(
        'playerSelect',
    ) as HTMLSelectElement | null;
    if (!selectEl) {
        return;
    }

    const players: PlayerRecord[] = RecordsManager.getPlayers();
    const currentPlayer: PlayerRecord | null = RecordsManager.getCurrentPlayer();

    selectEl.innerHTML = '';

    players.forEach((player: PlayerRecord): void => {
        const option: HTMLOptionElement = document.createElement('option');
        option.value = player.nick;
        option.textContent = player.nick;
        if (currentPlayer && player.nick === currentPlayer.nick) {
            option.selected = true;
        }
        selectEl.appendChild(option);
    });
}

/**
 * Настраивает обработчик изменения выбора игрока в toolbar
 */
function setupPlayerSelectHandler(): void {
    const selectEl: HTMLSelectElement | null = document.getElementById(
        'playerSelect',
    ) as HTMLSelectElement | null;
    if (!selectEl) {
        return;
    }

    selectEl.addEventListener('change', (): void => {
        const selectedNick: string = selectEl.value;
        if (selectedNick) {
            RecordsManager.setCurrentPlayer(selectedNick);
            setPlayerInfo();
            updateLeaderboard();

            // Сбрасываем счёт в тулбаре
            updateScoreDisplay(0);

            // Перезапускаем игру
            const gm = (window as unknown as Record<string, unknown>).gameManager as
                | GameManager<Entity & IDrawable>
                | undefined;
            if (gm) {
                gm.restartGame();
                updateLives(5);

                // Переустанавливаем callback для игрока после перезагрузки
                setTimeout((): void => {
                    if (gm.player) {
                        gm.player.onDeathCallback = (lives: number): void => {
                            updateLives(lives);
                        };
                        // Устанавливаем имя игрока
                        gm.player.name = selectedNick;
                    }
                }, 500);
            }
        }
    });
}

/**
 * Обновляет весь UI, связанный с игроком
 */
function refreshUI(): void {
    setPlayerInfo();
    updateLeaderboard();
    updatePlayerSelect();
}

/**
 * Обновляет отображение жизней игрока в header
 * @param lives Количество жизней игрока
 */
function updateLives(lives: number): void {
    const livesEl: HTMLElement | null = document.getElementById('headerPlayerLives') as HTMLElement;
    if (!livesEl) {
        return;
    }

    const hearts: NodeListOf<HTMLElement> = livesEl.querySelectorAll<HTMLElement>('.life-heart');
    hearts.forEach((heart: HTMLElement, index: number): void => {
        if (index < lives) {
            heart.classList.remove('life-heart--empty');
            heart.classList.add('life-heart--full');
        } else {
            heart.classList.remove('life-heart--full');
            heart.classList.add('life-heart--empty');
        }
    });
}

/**
 * Показывает модальное окно Game Over с информацией об игроке
 * @param playerNick Имя игрока
 * @param score Очки игрока
 * @returns void
 */
function showGameOverModal(playerNick: string, score: number): void {
    const modal: HTMLDivElement | null = document.getElementById('gameOverModal') as HTMLDivElement;
    const nickEl: HTMLElement | null = document.getElementById('gameOverPlayerNick') as HTMLElement;
    const scoreEl: HTMLElement | null = document.getElementById(
        'gameOverPlayerScore',
    ) as HTMLElement;

    if (!modal) {
        return;
    }

    if (nickEl) {
        nickEl.textContent = playerNick;
    }
    if (scoreEl) {
        scoreEl.textContent = score.toString();
    }

    modal.classList.remove('modal--hidden');
}

/**
 * Скрывает модальное окно Game Over
 */
function hideGameOverModal(): void {
    const modal: HTMLDivElement | null = document.getElementById('gameOverModal') as HTMLDivElement;
    if (modal) {
        modal.classList.add('modal--hidden');
    }
}
/**
 * Показывает модальное окно победы с информацией об игроке и таблицей рекордов
 * @param playerNick Имя игрока
 * @param score Очки игрока
 */
function showVictoryModal(playerNick: string, score: number): void {
    const modal: HTMLDivElement | null = document.getElementById('victoryModal') as HTMLDivElement;
    const nickEl: HTMLElement | null = document.getElementById('victoryPlayerNick') as HTMLElement;
    const scoreEl: HTMLElement | null = document.getElementById(
        'victoryPlayerScore',
    ) as HTMLElement;
    const leaderboardEl: HTMLOListElement | null = document.getElementById(
        'victoryLeaderboard',
    ) as HTMLOListElement;

    if (!modal) {
        return;
    }
    if (nickEl) {
        nickEl.textContent = playerNick;
    }
    if (scoreEl) {
        scoreEl.textContent = score.toString();
    }

    // Заполняем таблицу рекордов
    if (leaderboardEl) {
        const leaderboard: PlayerRecord[] = RecordsManager.getLeaderboard(10);
        leaderboardEl.innerHTML = '';

        if (leaderboard.length === 0) {
            const emptyMsg: HTMLLIElement = document.createElement('li');
            emptyMsg.textContent = 'Нет рекордов';
            emptyMsg.style.listStyle = 'none';
            leaderboardEl.appendChild(emptyMsg);
        } else {
            leaderboard.forEach((player: PlayerRecord): void => {
                const item: HTMLLIElement = document.createElement('li');
                item.className = 'victory-leaderboard__item';

                // Выделяем текущего игрока
                if (player.nick === playerNick) {
                    item.classList.add('victory-leaderboard__item--current');
                }

                item.innerHTML = `
                    <span class="victory-leaderboard__nick">${player.nick}</span>
                    <span class="victory-leaderboard__score">${player.score}</span>
                `;
                leaderboardEl.appendChild(item);
            });
        }
    }

    modal.classList.remove('modal--hidden');
}

/**
 * Скрывает модальное окно победы
 */
function hideVictoryModal(): void {
    const modal = document.getElementById('victoryModal') as HTMLDivElement | null;
    if (modal) {
        modal.classList.add('modal--hidden');
    }
}
/**
 * Открывает модальное окно для ввода ника игрока
 */
function openPlayerModal(): void {
    const modal: HTMLDivElement | null = document.getElementById('nickModal') as HTMLDivElement;
    const nickInput: HTMLInputElement | null = document.getElementById(
        'playerNickInput',
    ) as HTMLInputElement;

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

    const existingNicks: string[] = RecordsManager.getAllNicks();
    if (existingNicks.length > 0) {
        const datalist: HTMLDataListElement = document.createElement('datalist');
        datalist.id = 'nicksDatalist';
        existingNicks.forEach((nick: string): void => {
            const option: HTMLOptionElement = document.createElement('option');
            option.value = nick;
            datalist.appendChild(option);
        });
        nickInput.setAttribute('list', 'nicksDatalist');
        nickInput.parentElement?.appendChild(datalist);
    }
}

/**
 * Инициализирует игру, менеджеры и запускает игровой цикл
 */
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

    // Настраиваем EventsManager для обработки событий клавиатуры
    eventsManager.setup(canvas);

    // Инициализируем отображение жизней
    updateLives(5);

    // Настраиваем callback для обновления UI при смерти игрока
    const setupPlayerCallbacks = (): void => {
        if (gameManager.player) {
            const currentPlayer: PlayerRecord | null = RecordsManager.getCurrentPlayer();
            if (currentPlayer) {
                gameManager.player.name = currentPlayer.nick;
            }

            gameManager.player.onDeathCallback = (lives: number): void => {
                updateLives(lives);
            };
        } else {
            // Игрок еще не создан, ждем
            setTimeout(setupPlayerCallbacks, 100);
        }
    };
    setupPlayerCallbacks();

    // Настраиваем callback для изменения счёта
    gameManager.onScoreChangeCallback = (score: number): void => {
        updateScoreDisplay(score);
    };

    // Настраиваем callback для Game Over
    gameManager.onGameOverCallback = (playerName: string, score: number): void => {
        const currentPlayer = RecordsManager.getCurrentPlayer();
        const playerNick = currentPlayer ? currentPlayer.nick : playerName;

        // Сохраняем рекорд только если текущий счёт лучше предыдущего
        if (currentPlayer && score > currentPlayer.score) {
            RecordsManager.setScore(score);
            updateLeaderboard();
        }

        showGameOverModal(playerNick, score);
    };

    // Настраиваем callback для победы
    gameManager.onVictoryCallback = (playerName: string, score: number): void => {
        const currentPlayer: PlayerRecord | null = RecordsManager.getCurrentPlayer();
        const playerNick: string = currentPlayer ? currentPlayer.nick : playerName;

        // Сохраняем рекорд только если текущий счёт лучше предыдущего
        if (currentPlayer && score > currentPlayer.score) {
            RecordsManager.setScore(score);
            updateLeaderboard();
        }

        showVictoryModal(playerNick, score);
    };

    // Настраиваем callback для перехода на следующий уровень
    gameManager.onNextLevelCallback = (level: number, playerLives: number): void => {
        console.log(`Level ${level + 1} started!`);
        updateLives(playerLives);

        // Переустанавливаем callback для игрока на новом уровне
        const setupNewPlayerCallback = (): void => {
            if (gameManager.player) {
                gameManager.player.onDeathCallback = (lives: number): void => {
                    updateLives(lives);
                };
                console.log('Player death callback set for new level');
            } else {
                // Игрок ещё не создан, ждём
                setTimeout(setupNewPlayerCallback, 100);
            }
        };
        setupNewPlayerCallback();
    };

    // Сохраняем ссылку на gameManager для перезапуска
    (window as unknown as Record<string, unknown>).gameManager = gameManager;

    // Игровой цикл для постоянной отрисовки
    function gameLoop(): void {
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gameManager.update(ctx);
        requestAnimationFrame(gameLoop);
    }

    // Запускаем игровой цикл
    gameLoop();

    // Настраиваем кнопки управления в toolbar
    setupToolbarControls(gameManager);
}

/**
 * Обновляет иконку кнопки паузы в toolbar
 * @param isPaused Флаг, указывающий, находится ли игра на паузе
 */
function updatePauseButton(isPaused: boolean): void {
    const pauseBtn: HTMLButtonElement | null = document.getElementById(
        'pauseBtn',
    ) as HTMLButtonElement;
    if (pauseBtn) {
        pauseBtn.textContent = isPaused ? '▶' : '⏸';
        pauseBtn.title = isPaused ? 'Продолжить (P)' : 'Пауза (P)';
        pauseBtn.classList.toggle('toolbar__control-btn--paused', isPaused);
    }
}

/**
 * Настраивает обработчики для кнопок паузы и перезапуска в toolbar
 * @param gameManager Экземпляр GameManager<Entity & IDrawable>
 */
function setupToolbarControls(gameManager: GameManager<Entity & IDrawable>): void {
    const pauseBtn: HTMLButtonElement | null = document.getElementById(
        'pauseBtn',
    ) as HTMLButtonElement;
    const restartBtn: HTMLButtonElement | null = document.getElementById(
        'restartBtn',
    ) as HTMLButtonElement;

    // Кнопка паузы
    if (pauseBtn) {
        pauseBtn.addEventListener('click', (): void => {
            if (gameManager.isGameOver) {
                return;
            }

            gameManager.isPaused = !gameManager.isPaused;
            updatePauseButton(gameManager.isPaused);
        });
    }

    // Кнопка перезапуска
    if (restartBtn) {
        restartBtn.addEventListener('click', (): void => {
            gameManager.restart();
            updateLives(5);
            updateScoreDisplay(0);
            updatePauseButton(false);

            // Переустанавливаем callback для игрока после перезагрузки
            setTimeout((): void => {
                if (gameManager.player) {
                    gameManager.player.onDeathCallback = (lives: number): void => {
                        updateLives(lives);
                    };
                }
            }, 500);
        });
    }

    // Сохраняем ссылку на updatePauseButton для использования в GameManager
    (window as unknown as Record<string, unknown>).__updatePauseButton = updatePauseButton;
}

// Инициализация после загрузки DOM
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

    // Game Over modal buttons
    const restartGameBtn = document.getElementById('restartGameBtn') as HTMLButtonElement | null;
    const changePlayerGameOverBtn = document.getElementById(
        'changePlayerGameOverBtn',
    ) as HTMLButtonElement | null;

    // Victory modal buttons
    const restartVictoryBtn = document.getElementById(
        'restartVictoryBtn',
    ) as HTMLButtonElement | null;
    const changePlayerVictoryBtn = document.getElementById(
        'changePlayerVictoryBtn',
    ) as HTMLButtonElement | null;

    // Обработчик кнопки "Сменить игрока"
    if (changePlayerBtn) {
        changePlayerBtn.addEventListener('click', (): void => {
            openPlayerModal();
            // Сбрасываем счёт в тулбаре
            updateScoreDisplay(0);
            // Перезапускаем игру
            const gm = (window as unknown as Record<string, unknown>).gameManager as
                | GameManager<Entity & IDrawable>
                | undefined;
            if (gm) {
                gm.restartGame();
                updateLives(5);
            }
        });
    }

    // Обработчики для Game Over модалки
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', (): void => {
            hideGameOverModal();
            const gm: GameManager<Entity & IDrawable> | undefined = (
                window as unknown as Record<string, unknown>
            ).gameManager as GameManager<Entity & IDrawable> | undefined;
            if (gm) {
                gm.restart();
                updateLives(5);

                // Переустанавливаем callback для игрока после перезагрузки
                setTimeout((): void => {
                    if (gm.player) {
                        gm.player.onDeathCallback = (lives: number): void => {
                            updateLives(lives);
                        };
                    }
                }, 500);
            }
        });
    }
    // Обработчик смены игрока из Game Over модального окна
    if (changePlayerGameOverBtn) {
        changePlayerGameOverBtn.addEventListener('click', (): void => {
            hideGameOverModal();
            openPlayerModal();
            // При смене игрока перезапускаем игру
            const gm: GameManager<Entity & IDrawable> | undefined = (
                window as unknown as Record<string, unknown>
            ).gameManager as GameManager<Entity & IDrawable> | undefined;
            if (gm) {
                gm.restart();
                updateLives(5);

                // Переустанавливаем callback для игрока после перезагрузки
                setTimeout((): void => {
                    if (gm.player) {
                        gm.player.onDeathCallback = (lives: number): void => {
                            updateLives(lives);
                        };
                    }
                }, 500);
            }
        });
    }

    // Обработчики для Victory модального окна
    if (restartVictoryBtn) {
        restartVictoryBtn.addEventListener('click', (): void => {
            hideVictoryModal();
            const gm: GameManager<Entity & IDrawable> | undefined = (
                window as unknown as Record<string, unknown>
            ).gameManager as GameManager<Entity & IDrawable> | undefined;
            if (gm) {
                gm.restart();
                updateLives(5);

                // Переустанавливаем callback для игрока после перезагрузки
                setTimeout((): void => {
                    if (gm.player) {
                        gm.player.onDeathCallback = (lives: number): void => {
                            updateLives(lives);
                        };
                    }
                }, 500);
            }
        });
    }

    // Обработчик смены игрока из Victory модального окна
    if (changePlayerVictoryBtn) {
        changePlayerVictoryBtn.addEventListener('click', (): void => {
            hideVictoryModal();
            openPlayerModal();
            // При смене игрока перезапускаем игру
            const gm: GameManager<Entity & IDrawable> | undefined = (
                window as unknown as Record<string, unknown>
            ).gameManager as GameManager<Entity & IDrawable> | undefined;
            if (gm) {
                gm.restart();
                updateLives(5);

                // Переустанавливаем callback для игрока после перезагрузки
                setTimeout((): void => {
                    if (gm.player) {
                        gm.player.onDeathCallback = (lives: number): void => {
                            updateLives(lives);
                        };
                    }
                }, 500);
            }
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

    const currentPlayer: PlayerRecord | null = RecordsManager.getCurrentPlayer();
    if (currentPlayer) {
        // If player already exists, populate UI and start immediately
        refreshUI();
        if (modal) {
            modal.classList.add('modal--hidden');
        }
        const canvas: HTMLCanvasElement | null = document.getElementById(
            'gameCanvas',
        ) as HTMLCanvasElement;

        if (canvas) {
            canvas.dataset.gameStarted = 'true';
        }
        initGame();
    } else {
        // Show modal to enter nickname
        openPlayerModal();
    }
});
