import type { Entity, Player } from '@/entities';
import { Bomb, Explosion, Teleport, Enemy, Bonus } from '@/entities';
import type { IDrawable } from '@/entities/interfaces';
import type { EventsManager } from './EventsManager';
import type { MapManager } from './MapManager';
import { PhysicsManager } from './PhysicsManager';
import { SoundManager } from './SoundManager';

// Callback для уведомления о Game Over
export type GameOverCallback = (playerName: string, score: number) => void;
// Callback для перехода на следующий уровень
export type NextLevelCallback = (level: number, playerLives: number) => void;
// Callback для победы (прохождения всех уровней)
export type VictoryCallback = (playerName: string, score: number) => void;
// Callback для изменения очков
export type ScoreChangeCallback = (score: number) => void;

// Константы очков
export const SCORE_ENEMY_KILL = 400;
export const SCORE_LOSE_LIFE = -200;
export const SCORE_DESTROY_OBSTACLE = 100;
export const SCORE_USE_TELEPORT = 300;
export const SCORE_COLLECT_BONUS = 200;
export const SCORE_COMPLETE_ALL_LEVELS = 400;

type EntityCtor<T extends Entity> = {
    prototype: T;
};

type FactoryMap<T extends Entity> = Record<string, EntityCtor<T>>;

export class GameManager<T extends Entity & IDrawable> {
    factory: FactoryMap<T>;
    entities: T[];
    fireNum: number;
    player: null | Player;
    laterKill: T[];

    eventsManager: EventsManager;
    mapManager: MapManager | null;
    physicsManager: PhysicsManager<Player> | null;
    bombGameManager: GameManager<Bomb> | null;
    explosionGameManager: GameManager<Explosion> | null;
    teleportGameManager: GameManager<Teleport> | null;
    bonusGameManager: GameManager<Bonus> | null;
    soundManager: SoundManager | null;

    // Состояние игры
    isPaused: boolean;
    isGameOver: boolean;
    isLoading: boolean;
    pausePressed: boolean;
    restartPressed: boolean;
    onGameOverCallback: GameOverCallback | null;
    onNextLevelCallback: NextLevelCallback | null;
    onVictoryCallback: VictoryCallback | null;
    onScoreChangeCallback: ScoreChangeCallback | null;

    // Очки текущей сессии
    currentScore: number;

    // Уровни
    currentLevel: number;
    mapPaths: string[];

    constructor(eventsManager: EventsManager) {
        this.factory = {};
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.laterKill = [];

        this.eventsManager = eventsManager;
        this.mapManager = null;
        this.physicsManager = null;
        this.bombGameManager = null;
        this.explosionGameManager = null;
        this.teleportGameManager = null;
        this.bonusGameManager = null;
        this.soundManager = null;

        // Состояние игры
        this.isPaused = false;
        this.isGameOver = false;
        this.isLoading = false;
        this.pausePressed = false;
        this.restartPressed = false;
        this.onGameOverCallback = null;
        this.onNextLevelCallback = null;
        this.onVictoryCallback = null;
        this.onScoreChangeCallback = null;

        // Очки текущей сессии
        this.currentScore = 0;

        // Уровни
        this.currentLevel = 0;
        this.mapPaths = ['/maps/map1.json', '/maps/map2.json'];
    }

    setMapManager(mapManager: MapManager): void {
        this.mapManager = mapManager;
        // Инициализируем PhysicsManager после установки MapManager
        // PhysicsManager будет создан для конкретного игрока позже

        // Создаем отдельный GameManager для бомб только если его еще нет
        // Это предотвращает бесконечную рекурсию
        if (!this.bombGameManager) {
            this.bombGameManager = new GameManager<Bomb>(this.eventsManager);
            this.bombGameManager.mapManager = mapManager;
        }

        // Создаем отдельный GameManager для взрывов
        if (!this.explosionGameManager) {
            this.explosionGameManager = new GameManager<Explosion>(this.eventsManager);
            this.explosionGameManager.mapManager = mapManager;
        }

        // Создаем отдельный GameManager для телепортов
        if (!this.teleportGameManager) {
            this.teleportGameManager = new GameManager<Teleport>(this.eventsManager);
            this.teleportGameManager.mapManager = mapManager;
        }

        // Создаем отдельный GameManager для бонусов
        if (!this.bonusGameManager) {
            this.bonusGameManager = new GameManager<Bonus>(this.eventsManager);
            this.bonusGameManager.mapManager = mapManager;
        }

        // Создаем SoundManager и загружаем все звуки
        if (!this.soundManager) {
            this.soundManager = new SoundManager(this, mapManager);
            this.soundManager.loadArray([
                '/assets/sounds/BombermanDie.wav',
                '/assets/sounds/BombExplode.wav',
                '/assets/sounds/EnemyDie.wav',
                '/assets/sounds/ItemGet.wav',
                '/assets/sounds/PlaceBomb.wav',
                '/assets/sounds/StageClear.wav',
                '/assets/sounds/StageIntro.wav',
                '/assets/sounds/Walking1.wav',
                '/assets/sounds/Walking2.wav',
            ]);
            // Воспроизводим звук начала уровня
            this.soundManager.play('/assets/sounds/StageIntro.wav', { looping: false, volume: 0.5 });
        }
    }

    /**
     * Добавляет очки к текущему счёту
     * @param points Количество очков (может быть отрицательным)
     */
    addScore(points: number): void {
        this.currentScore = Math.max(0, this.currentScore + points);

        // Вызываем callback для обновления UI
        if (this.onScoreChangeCallback) {
            this.onScoreChangeCallback(this.currentScore);
        }
    }

    /**
     * Сбрасывает текущий счёт
     */
    resetScore(): void {
        this.currentScore = 0;
        if (this.onScoreChangeCallback) {
            this.onScoreChangeCallback(this.currentScore);
        }
    }

    initPlayer(obj: Player): void {
        this.player = obj;
        // Создаем PhysicsManager для игрока
        if (this.mapManager && !this.physicsManager) {
            this.physicsManager = new PhysicsManager<Player>(
                this.mapManager,
                this as unknown as GameManager<Player>,
            );
        }
        // Устанавливаем ссылку на physicsManager
        if (this.physicsManager) {
            obj.physicsManager = this.physicsManager;
        }
        // Устанавливаем ссылку на bombGameManager
        if (this.bombGameManager) {
            obj.gameManager = this.bombGameManager;
        }
        // Устанавливаем ссылку на explosionGameManager
        if (this.explosionGameManager) {
            obj.explosionGameManager = this.explosionGameManager;
        }
        // Устанавливаем ссылку на teleportGameManager
        if (this.teleportGameManager) {
            obj.teleportGameManager = this.teleportGameManager;
        }
        // Устанавливаем ссылку на bonusGameManager
        if (this.bonusGameManager) {
            obj.bonusGameManager = this.bonusGameManager;
        }
        // Устанавливаем ссылку на главный GameManager для доступа к препятствиям
        obj.mainGameManager = this;
    }

    kill(obj: T): void {
        this.laterKill.push(obj);
    }

    killEntity(obj: Entity & IDrawable): void {
        // Универсальный метод для удаления любых сущностей
        this.laterKill.push(obj as T);
    }

    update(ctx: CanvasRenderingContext2D): void {
        // Обработка паузы (с защитой от повторного срабатывания)
        if (this.eventsManager.action['pause'] && !this.pausePressed && !this.isGameOver) {
            this.isPaused = !this.isPaused;
            this.pausePressed = true;
            console.log(this.isPaused ? 'Game paused' : 'Game resumed');
            // Обновляем кнопку паузы в UI
            const updatePauseButton = ((window as unknown) as Record<string, unknown>).__updatePauseButton;
            if (typeof updatePauseButton === 'function') {
                updatePauseButton(this.isPaused);
            }
        }
        if (!this.eventsManager.action['pause']) {
            this.pausePressed = false;
        }

        // Обработка перезагрузки (с защитой от повторного срабатывания)
        if (this.eventsManager.action['restart'] && !this.restartPressed) {
            this.restartPressed = true;
            this.restartGame();
        }
        if (!this.eventsManager.action['restart']) {
            this.restartPressed = false;
        }

        // Если игрок ещё не загружен - только отрисовываем карту
        if (this.player === null) {
            if (this.mapManager) {
                this.mapManager.drawWithEntities(ctx, () => {
                    this.draw(ctx);
                });
            }
            return;
        }

        // Если игра на паузе или окончена - только отрисовка
        if (this.isPaused || this.isGameOver) {
            if (this.mapManager) {
                this.mapManager.drawWithEntities(ctx, () => {
                    this.draw(ctx);
                });
            }
            return;
        }

        // по умолчанию игрок никуда не двигается
        this.player.move_x = 0;
        this.player.move_y = 0;

        // поймали событие - обрабатываем
        if (this.eventsManager.action['up']) {
            this.player.move_y = -1;
        }
        if (this.eventsManager.action['down']) {
            this.player.move_y = 1;
        }
        if (this.eventsManager.action['left']) {
            this.player.move_x = -1;
        }
        if (this.eventsManager.action['right']) {
            this.player.move_x = 1;
        }
        if (this.eventsManager.action['bomb']) {
            this.player.placeBomb();
        }

        // Обновляем игрока
        this.player.update();

        // Обновляем бомбы
        if (this.bombGameManager) {
            this.bombGameManager.entities.forEach((bomb: Bomb): void => {
                bomb.update();
            });
        }

        // Обновляем взрывы
        if (this.explosionGameManager) {
            this.explosionGameManager.entities.forEach((explosion: Explosion): void => {
                explosion.update();
            });

            // Проверяем столкновение игрока со взрывами
            this.checkExplosionCollisions();

            // Проверяем столкновение врагов со взрывами
            this.checkEnemyExplosionCollisions();
        }

        // Проверяем столкновение игрока с врагами
        this.checkEnemyCollisions();

        // Обновляем телепорты
        if (this.teleportGameManager) {
            // Проверяем, есть ли ещё враги на карте
            const enemiesAlive = this.entities.some((e) => 'enemyType' in e);

            this.teleportGameManager.entities.forEach((teleport: Teleport): void => {
                teleport.update();
                // Телепорт активен только когда все враги уничтожены
                if (!enemiesAlive && !teleport.isActive) {
                    teleport.activate();
                } else if (enemiesAlive && teleport.isActive) {
                    teleport.deactivate();
                }
            });

            // Проверяем столкновение игрока с телепортом только если нет врагов
            if (!enemiesAlive) {
                this.checkTeleportCollisions();
            }
        }

        // Обновляем бонусы
        if (this.bonusGameManager) {
            this.bonusGameManager.entities.forEach((bonus: Bonus): void => {
                bonus.update();
            });

            // Проверяем столкновение игрока с бонусами
            this.checkBonusCollisions();
        }

        // обновление информации по всем объектам на карте
        this.entities.forEach((e: T): void => {
            try {
                if ('update' in e && typeof e.update === 'function') {
                    e.update();
                }
            } catch {
                // игнорируем ошибки обновления
            }
        });

        // удаление всех объектов, попавших в laterKill
        for (let i: number = 0; i < this.laterKill.length; ++i) {
            const idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1) {
                this.entities.splice(idx, 1); // удаление из массива 1 объекта
            }
        }

        if (this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }

        // Удаление бомб, попавших в laterKill
        if (this.bombGameManager && this.bombGameManager.laterKill.length > 0) {
            for (let i: number = 0; i < this.bombGameManager.laterKill.length; ++i) {
                const idx = this.bombGameManager.entities.indexOf(
                    this.bombGameManager.laterKill[i],
                );
                if (idx > -1) {
                    this.bombGameManager.entities.splice(idx, 1);
                }
            }
            this.bombGameManager.laterKill.length = 0;
        }

        // Удаление взрывов, попавших в laterKill
        if (this.explosionGameManager && this.explosionGameManager.laterKill.length > 0) {
            for (let i: number = 0; i < this.explosionGameManager.laterKill.length; ++i) {
                const idx = this.explosionGameManager.entities.indexOf(
                    this.explosionGameManager.laterKill[i],
                );
                if (idx > -1) {
                    this.explosionGameManager.entities.splice(idx, 1);
                }
            }
            this.explosionGameManager.laterKill.length = 0;
        }

        // Удаление телепортов, попавших в laterKill
        if (this.teleportGameManager && this.teleportGameManager.laterKill.length > 0) {
            for (let i: number = 0; i < this.teleportGameManager.laterKill.length; ++i) {
                const idx = this.teleportGameManager.entities.indexOf(
                    this.teleportGameManager.laterKill[i],
                );
                if (idx > -1) {
                    this.teleportGameManager.entities.splice(idx, 1);
                }
            }
            this.teleportGameManager.laterKill.length = 0;
        }

        // Удаление бонусов, попавших в laterKill
        if (this.bonusGameManager && this.bonusGameManager.laterKill.length > 0) {
            for (let i: number = 0; i < this.bonusGameManager.laterKill.length; ++i) {
                const idx = this.bonusGameManager.entities.indexOf(
                    this.bonusGameManager.laterKill[i],
                );
                if (idx > -1) {
                    this.bonusGameManager.entities.splice(idx, 1);
                }
            }
            this.bonusGameManager.laterKill.length = 0;
        }

        // очистка массива laterKill
        if (this.mapManager) {
            // Используем новый метод для отрисовки карты вместе с сущностями
            this.mapManager.drawWithEntities(ctx, () => {
                // Отрисовка сущностей происходит внутри масштабированного контекста
                this.draw(ctx);
            });
            if (this.player) {
                this.mapManager.centerAt(this.player.pos_x, this.player.pos_y);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Отрисовка телепортов (они на земле, рисуем первыми)
        if (this.teleportGameManager) {
            for (let i: number = 0; i < this.teleportGameManager.entities.length; ++i) {
                this.teleportGameManager.entities[i].draw(ctx);
            }
        }

        // Отрисовка бонусов (на земле, после телепортов)
        if (this.bonusGameManager) {
            for (let i: number = 0; i < this.bonusGameManager.entities.length; ++i) {
                this.bonusGameManager.entities[i].draw(ctx);
            }
        }

        // Отрисовка бомб (они на земле, рисуем первыми)
        if (this.bombGameManager) {
            for (let i: number = 0; i < this.bombGameManager.entities.length; ++i) {
                this.bombGameManager.entities[i].draw(ctx);
            }
        }

        // Отрисовка взрывов (они на земле, после бомб)
        if (this.explosionGameManager) {
            for (let i: number = 0; i < this.explosionGameManager.entities.length; ++i) {
                this.explosionGameManager.entities[i].draw(ctx);
            }
        }

        // Собираем все сущности (препятствия и игрока) для сортировки по Y
        const drawableEntities: (Entity & IDrawable)[] = [...this.entities];

        // Добавляем игрока в список для отрисовки
        if (this.player) {
            drawableEntities.push(this.player as unknown as Entity & IDrawable);
        }

        // Сортируем по Y-координате (объекты выше рисуются первыми)
        drawableEntities.sort((a, b) => a.pos_y - b.pos_y);

        // Отрисовка в правильном порядке
        for (let i: number = 0; i < drawableEntities.length; ++i) {
            drawableEntities[i].draw(ctx);
        }
    }

    /**
     * Проверяет столкновение игрока со взрывами
     */
    checkExplosionCollisions(): void {
        if (!this.player || !this.explosionGameManager) {
            return;
        }

        // Если игрок неуязвим - пропускаем проверку
        if (this.player.isInvulnerable) {
            return;
        }

        const playerCenterX = this.player.pos_x + this.player.size_x / 2;
        const playerCenterY = this.player.pos_y + this.player.size_y / 2;

        for (const explosion of this.explosionGameManager.entities) {
            // Проверяем, находится ли центр игрока в области взрыва
            const explosionCenterX = explosion.pos_x + explosion.size_x / 2;
            const explosionCenterY = explosion.pos_y + explosion.size_y / 2;

            // Расстояние между центрами
            const dx = Math.abs(playerCenterX - explosionCenterX);
            const dy = Math.abs(playerCenterY - explosionCenterY);

            // Радиус коллизии (половина размера тайла)
            const collisionRadius = 12; // Немного меньше тайла для более честной коллизии

            if (dx < collisionRadius && dy < collisionRadius) {
                // Игрок задет взрывом
                this.player.kill();

                // Штраф за потерю жизни
                this.addScore(SCORE_LOSE_LIFE);

                // Проверяем, закончились ли жизни
                if (!this.player.isAlive()) {
                    this.gameOver();
                }

                break; // Одно попадание за кадр достаточно
            }
        }
    }

    /**
     * Проверяет столкновение игрока с врагами
     */
    checkEnemyCollisions(): void {
        if (!this.player) {
            return;
        }

        // Если игрок неуязвим - пропускаем проверку
        if (this.player.isInvulnerable) {
            return;
        }

        const playerCenterX = this.player.pos_x + this.player.size_x / 2;
        const playerCenterY = this.player.pos_y + this.player.size_y / 2;

        for (const entity of this.entities) {
            if (entity instanceof Enemy) {
                const enemyCenterX = entity.pos_x + entity.size_x / 2;
                const enemyCenterY = entity.pos_y + entity.size_y / 2;

                const dx = Math.abs(playerCenterX - enemyCenterX);
                const dy = Math.abs(playerCenterY - enemyCenterY);

                // Радиус коллизии
                const collisionRadius = 10;

                if (dx < collisionRadius && dy < collisionRadius) {
                    // Игрок столкнулся с врагом
                    this.player.kill();

                    // Штраф за потерю жизни
                    this.addScore(SCORE_LOSE_LIFE);

                    if (!this.player.isAlive()) {
                        this.gameOver();
                    }

                    break;
                }
            }
        }
    }

    /**
     * Проверяет столкновение врагов со взрывами
     */
    checkEnemyExplosionCollisions(): void {
        if (!this.explosionGameManager) {
            return;
        }

        const enemiesToKill: Enemy[] = [];

        for (const entity of this.entities) {
            if (entity instanceof Enemy) {
                const enemyCenterX = entity.pos_x + entity.size_x / 2;
                const enemyCenterY = entity.pos_y + entity.size_y / 2;

                for (const explosion of this.explosionGameManager.entities) {
                    const explosionCenterX = explosion.pos_x + explosion.size_x / 2;
                    const explosionCenterY = explosion.pos_y + explosion.size_y / 2;

                    const dx = Math.abs(enemyCenterX - explosionCenterX);
                    const dy = Math.abs(enemyCenterY - explosionCenterY);

                    const collisionRadius = 12;

                    if (dx < collisionRadius && dy < collisionRadius) {
                        enemiesToKill.push(entity);
                        break;
                    }
                }
            }
        }

        // Обрабатываем попадания по врагам
        for (const enemy of enemiesToKill) {
            // Наносим урон врагу
            const isDead = enemy.takeDamage(1);

            if (isDead) {
                // Воспроизводим звук смерти врага
                if (this.soundManager) {
                    this.soundManager.playWorldSound('/assets/sounds/EnemyDie.wav', enemy.pos_x, enemy.pos_y);
                }
                // Начисляем очки за убийство врага
                this.addScore(SCORE_ENEMY_KILL);
                this.kill(enemy as unknown as T);
            }
        }
    }

    /**
     * Проверяет столкновение игрока с бонусами
     */
    checkBonusCollisions(): void {
        if (!this.player || !this.bonusGameManager) {
            return;
        }

        const playerCenterX = this.player.pos_x + this.player.size_x / 2;
        const playerCenterY = this.player.pos_y + this.player.size_y / 2;

        const bonusesToCollect: Bonus[] = [];

        for (const bonus of this.bonusGameManager.entities) {
            const bonusCenterX = bonus.pos_x + bonus.size_x / 2;
            const bonusCenterY = bonus.pos_y + bonus.size_y / 2;

            const dx = Math.abs(playerCenterX - bonusCenterX);
            const dy = Math.abs(playerCenterY - bonusCenterY);

            // Радиус коллизии для сбора бонуса
            const collisionRadius = 12;

            if (dx < collisionRadius && dy < collisionRadius) {
                bonusesToCollect.push(bonus);
            }
        }

        // Применяем собранные бонусы
        for (const bonus of bonusesToCollect) {
            this.player.applyBonus(bonus.bonusType);
            this.bonusGameManager.kill(bonus);

            // Начисляем очки за сбор бонуса
            this.addScore(SCORE_COLLECT_BONUS);

            // Воспроизводим звук подбора бонуса
            if (this.soundManager) {
                this.soundManager.play('/assets/sounds/ItemGet.wav', { looping: false, volume: 0.6 });
            }
            console.log(`Collected bonus: ${bonus.bonusType}`);
        }
    }

    /**
     * Завершает игру (Game Over)
     */
    gameOver(): void {
        this.isGameOver = true;

        // Вызываем callback для отображения окна Game Over
        if (this.onGameOverCallback && this.player) {
            // Получаем имя игрока из записей
            this.onGameOverCallback(this.player.name, this.currentScore);
        }
    }

    /**
     * Перезапускает игру
     */
    restart(): void {
        this.isGameOver = false;
        this.isPaused = false;

        // Сбрасываем уровень на первый
        this.currentLevel = 0;

        // Сбрасываем счёт
        this.resetScore();

        // Сохраняем параметры игрока для перезагрузки
        const playerName = this.player ? this.player.name : 'Player';

        // Очищаем все сущности
        this.entities.length = 0;
        this.laterKill.length = 0;

        // Очищаем бомбы
        if (this.bombGameManager) {
            this.bombGameManager.entities.length = 0;
            this.bombGameManager.laterKill.length = 0;
        }

        // Очищаем взрывы
        if (this.explosionGameManager) {
            this.explosionGameManager.entities.length = 0;
            this.explosionGameManager.laterKill.length = 0;
        }

        // Очищаем телепорты
        if (this.teleportGameManager) {
            this.teleportGameManager.entities.length = 0;
            this.teleportGameManager.laterKill.length = 0;
        }

        // Сбрасываем игрока
        this.player = null;
        this.physicsManager = null;

        // Перезагружаем первую карту с новыми объектами
        if (this.mapManager) {
            this.mapManager.loadNewMap(this.mapPaths[0], 5, playerName);
        }
    }

    /**
     * Проверяет столкновение игрока с телепортом
     */
    checkTeleportCollisions(): void {
        if (!this.player || !this.teleportGameManager) {
            return;
        }

        const playerCenterX = this.player.pos_x + this.player.size_x / 2;
        const playerCenterY = this.player.pos_y + this.player.size_y / 2;

        for (const teleport of this.teleportGameManager.entities) {
            // Проверяем только активные телепорты
            if (!teleport.canUse()) {
                continue;
            }

            const teleportCenterX = teleport.pos_x + teleport.size_x / 2;
            const teleportCenterY = teleport.pos_y + teleport.size_y / 2;

            // Расстояние между центрами
            const dx = Math.abs(playerCenterX - teleportCenterX);
            const dy = Math.abs(playerCenterY - teleportCenterY);

            // Радиус коллизии
            const collisionRadius = 10;

            if (dx < collisionRadius && dy < collisionRadius) {
                // Игрок вошёл в телепорт - переход на следующий уровень
                console.log('Player entered teleport! Loading next level...');

                // Начисляем очки за использование телепорта
                this.addScore(SCORE_USE_TELEPORT);

                // Ставим игру на паузу во время перехода
                this.isPaused = true;

                // Воспроизводим звук прохождения уровня и после его окончания загружаем следующий уровень
                if (this.soundManager) {
                    this.soundManager.playWithCallback('/assets/sounds/StageClear.wav', () => {
                        this.nextLevel();
                    }, { volume: 0.7 });
                } else {
                    this.nextLevel();
                }
                break;
            }
        }
    }

    /**
     * Переход на следующий уровень
     */
    nextLevel(): void {
        this.currentLevel++;

        // Проверяем, есть ли ещё уровни
        if (this.currentLevel >= this.mapPaths.length) {
            // Все уровни пройдены - победа!
            console.log('Congratulations! All levels completed!');

            // Начисляем бонус за прохождение всех уровней
            this.addScore(SCORE_COMPLETE_ALL_LEVELS);

            // Сохраняем текущее состояние игрока для экрана победы
            const playerName = this.player ? this.player.name : 'Player';
            const playerScore = this.currentScore;

            // Показываем экран победы
            if (this.onVictoryCallback) {
                this.onVictoryCallback(playerName, playerScore);
            }

            // Возвращаемся на первый уровень (но не загружаем его сразу)
            this.currentLevel = 0;

            // Останавливаем игру
            this.isPaused = true;
            return;
        }

        const nextMapPath = this.mapPaths[this.currentLevel];
        console.log(`Loading level ${this.currentLevel + 1}: ${nextMapPath}`);

        // Сохраняем текущее состояние игрока
        const playerLives = this.player ? this.player.lives : 5;
        const playerName = this.player ? this.player.name : 'Player';

        // Очищаем все сущности
        this.entities.length = 0;
        this.laterKill.length = 0;

        if (this.bombGameManager) {
            this.bombGameManager.entities.length = 0;
            this.bombGameManager.laterKill.length = 0;
        }

        if (this.explosionGameManager) {
            this.explosionGameManager.entities.length = 0;
            this.explosionGameManager.laterKill.length = 0;
        }

        if (this.teleportGameManager) {
            this.teleportGameManager.entities.length = 0;
            this.teleportGameManager.laterKill.length = 0;
        }

        if (this.bonusGameManager) {
            this.bonusGameManager.entities.length = 0;
            this.bonusGameManager.laterKill.length = 0;
        }

        // Сбрасываем бонусы игрока перед переходом на новый уровень
        if (this.player) {
            this.player.resetBonuses();
        }

        // Сбрасываем игрока
        this.player = null;
        this.physicsManager = null;

        // Загружаем новую карту
        if (this.mapManager) {
            this.mapManager.loadNewMap(nextMapPath, playerLives, playerName);
        }

        // Воспроизводим звук начала нового уровня
        if (this.soundManager) {
            this.soundManager.play('/assets/sounds/StageIntro.wav', { looping: false, volume: 0.5 });
        }

        // Снимаем паузу после загрузки нового уровня
        this.isPaused = false;

        // Вызываем callback для обновления UI
        if (this.onNextLevelCallback) {
            this.onNextLevelCallback(this.currentLevel, playerLives);
        }
    }

    /**
     * Перезапуск игры с первого уровня
     */
    restartGame(): void {
        console.log('Restarting game...');

        // Сбрасываем состояние игры
        this.isGameOver = false;
        this.isPaused = false;
        this.currentLevel = 0;
        this.currentScore = 0;

        // Очищаем все сущности
        this.entities.length = 0;
        this.laterKill.length = 0;

        if (this.bombGameManager) {
            this.bombGameManager.entities.length = 0;
            this.bombGameManager.laterKill.length = 0;
        }

        if (this.explosionGameManager) {
            this.explosionGameManager.entities.length = 0;
            this.explosionGameManager.laterKill.length = 0;
        }

        if (this.teleportGameManager) {
            this.teleportGameManager.entities.length = 0;
            this.teleportGameManager.laterKill.length = 0;
        }

        if (this.bonusGameManager) {
            this.bonusGameManager.entities.length = 0;
            this.bonusGameManager.laterKill.length = 0;
        }

        // Сбрасываем игрока
        this.player = null;
        this.physicsManager = null;

        // Останавливаем все звуки
        if (this.soundManager) {
            this.soundManager.stopAll();
        }

        // Загружаем первую карту
        const firstMapPath = this.mapPaths[0];
        if (this.mapManager) {
            this.mapManager.loadNewMap(firstMapPath, 5, 'Player');
        }

        // Воспроизводим звук начала уровня
        if (this.soundManager) {
            this.soundManager.play('/assets/sounds/StageIntro.wav', { looping: false, volume: 0.5 });
        }

        // Обновляем UI счёта
        if (this.onScoreChangeCallback) {
            this.onScoreChangeCallback(this.currentScore);
        }
    }

    play() {}
}
