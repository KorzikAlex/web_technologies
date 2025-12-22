import type { SpriteManager, PhysicsManager, GameManager } from '@/managers';
import { Entity, Bomb, Enemy, Bonus, type BonusType, Explosion, Teleport } from './';
import type { IDrawable, IInteractEntity, IMovable, IHaveName, IInteractMap } from './';

// Callback для уведомления о смерти игрока
export type PlayerDeathCallback = (lives: number) => void;

export class Player
    extends Entity
    implements IDrawable, IInteractEntity, IMovable, IHaveName, IInteractMap
{
    name: string;
    lifetime: number;
    move_x: number;
    move_y: number;
    speed: number;
    spriteManager: SpriteManager;
    physicsManager: PhysicsManager<Player> | null;
    gameManager: GameManager<Bomb> | null;
    explosionGameManager: GameManager<Explosion> | null;
    teleportGameManager: GameManager<Teleport> | null;
    bonusGameManager: GameManager<Bonus> | null;
    mainGameManager: GameManager<Entity & IDrawable> | null;
    lastBombTime: number;
    bombCooldown: number;
    maxBombs: number;
    activeBombs: number;
    explosionRadius: number;

    // Система бонусов (действуют до конца уровня)
    baseSpeed: number;
    hasSpeedBonus: boolean;
    hasFastBombBonus: boolean;
    hasBigBombBonus: boolean;

    // Система жизней
    lives: number;
    maxLives: number;
    startX: number;
    startY: number;
    isInvulnerable: boolean;
    invulnerabilityTimer: number;
    invulnerabilityDuration: number;
    onDeathCallback: PlayerDeathCallback | null;

    // Анимация
    private animationFrame: number;
    private animationTimer: number;
    private readonly animationSpeed: number = 100; // мс между кадрами
    private readonly maxFrames: number = 4; // количество кадров анимации
    private currentDirection: 'left' | 'right' | 'up' | 'down'; // текущее направление
    private isMoving: boolean;

    // Звук ходьбы
    private walkingSoundTimer: number;
    private readonly walkingSoundInterval: number = 1000; // мс между звуками шагов
    private currentWalkingSound: number; // чередование между Walking1 и Walking2

    constructor(
        x: number = 0,
        y: number = 0,
        size_x: number = 0,
        size_y: number = 0,
        lifetime: number = 100,
        move_x: number = 0,
        move_y: number = 0,
        speed: number = 1,
        spriteManager: SpriteManager,
    ) {
        super(x, y, size_x, size_y);

        this.name = 'Player';
        this.lifetime = lifetime;
        this.move_x = move_x;
        this.move_y = move_y;
        this.speed = speed;
        this.spriteManager = spriteManager;
        this.physicsManager = null;
        this.gameManager = null;
        this.explosionGameManager = null;
        this.teleportGameManager = null;
        this.bonusGameManager = null;
        this.mainGameManager = null;
        this.lastBombTime = 0;
        this.bombCooldown = 300; // Задержка 300мс между установками бомб
        this.maxBombs = 1; // По умолчанию можно ставить только 1 бомбу
        this.activeBombs = 0; // Количество активных бомб
        this.explosionRadius = 1; // Базовый радиус взрыва - 1 тайл

        // Система бонусов
        this.baseSpeed = speed;
        this.hasSpeedBonus = false;
        this.hasFastBombBonus = false;
        this.hasBigBombBonus = false;

        // Система жизней
        this.lives = 5;
        this.maxLives = 5;
        this.startX = x; // Сохраняем начальную позицию для респавна
        this.startY = y;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 2000; // 2 секунды неуязвимости после респавна
        this.onDeathCallback = null;

        // Анимация
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.currentDirection = 'down';
        this.isMoving = false;

        // Звук ходьбы
        this.walkingSoundTimer = 0;
        this.currentWalkingSound = 1;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Мерцание при неуязвимости
        if (this.isInvulnerable) {
            // Мерцаем с частотой около 10 раз в секунду
            if (Math.floor(this.invulnerabilityTimer / 100) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        // Определяем кадр анимации
        const frameNum = this.animationFrame + 1;

        // Для движения влево используем спрайты left с инверсией по X
        if (this.currentDirection === 'left') {
            const spriteName = `player_left_${frameNum}`;
            const sprite = this.spriteManager.getSprite(spriteName);

            if (sprite) {
                // Сохраняем состояние контекста
                ctx.save();
                // Перемещаемся к центру спрайта и инвертируем
                ctx.translate(this.pos_x + this.size_x, this.pos_y);
                ctx.scale(-1, 1);
                // Рисуем спрайт в новой системе координат
                this.spriteManager.drawSprite(ctx, spriteName, 0, 0);
                // Восстанавливаем состояние
                ctx.restore();
            } else {
                // Заглушка
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.pos_x, this.pos_y, 16, 16);
            }
        } else if (this.currentDirection === 'right') {
            // Для движения вправо используем спрайты left без инверсии
            const spriteName = `player_left_${frameNum}`;
            this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
        } else {
            // Для остальных направлений рисуем нормально
            const spriteName = `player_${this.currentDirection}_${frameNum}`;
            this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
        }

        // Восстанавливаем прозрачность
        ctx.globalAlpha = 1.0;
    }

    update(): void {
        const deltaTime = 16.67; // ~60 FPS

        // Определяем направление движения
        this.isMoving = this.move_x !== 0 || this.move_y !== 0;

        if (this.isMoving) {
            // Определяем направление (приоритет горизонтальному движению)
            if (this.move_x > 0) {
                this.currentDirection = 'right';
            } else if (this.move_x < 0) {
                this.currentDirection = 'left';
            } else if (this.move_y > 0) {
                this.currentDirection = 'down';
            } else if (this.move_y < 0) {
                this.currentDirection = 'up';
            }

            // Обновляем анимацию
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % this.maxFrames;
            }

            // Звук ходьбы
            this.walkingSoundTimer += deltaTime;
            if (this.walkingSoundTimer >= this.walkingSoundInterval) {
                this.walkingSoundTimer = 0;
                if (this.mainGameManager?.soundManager) {
                    const soundPath = `/assets/sounds/Walking${this.currentWalkingSound}.wav`;
                    this.mainGameManager.soundManager.play(soundPath, {
                        looping: false,
                        volume: 0.3,
                    });
                    // Чередуем звуки
                    this.currentWalkingSound = this.currentWalkingSound === 1 ? 2 : 1;
                }
            }
        } else {
            // Сбрасываем анимацию на первый кадр при остановке
            this.animationFrame = 0;
            this.animationTimer = 0;
            this.walkingSoundTimer = 0;
        }

        // Обновляем таймер неуязвимости
        if (this.isInvulnerable) {
            this.invulnerabilityTimer += deltaTime;
            if (this.invulnerabilityTimer >= this.invulnerabilityDuration) {
                this.isInvulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }

        // Используем PhysicsManager для обновления позиции
        if (this.physicsManager && this.isMoving) {
            this.physicsManager.update(this);
        }
    }

    onTouchEntity<T extends Entity>(_obj: T): void {
        // TODO: реализовать взаимодействие с объектами
    }

    onTouchMap(_tileIndex: number): void {
        // Обработка столкновения со стеной - ничего не делаем, PhysicsManager заблокирует движение
    }

    kill(): void {
        // Если игрок неуязвим - игнорируем
        if (this.isInvulnerable) {
            return;
        }

        // Уменьшаем количество жизней
        this.lives--;

        // Воспроизводим звук смерти игрока
        if (this.mainGameManager?.soundManager) {
            this.mainGameManager.soundManager.play('/assets/sounds/BombermanDie.wav', {
                looping: false,
                volume: 0.7,
            });
        }

        // Уведомляем о смерти
        if (this.onDeathCallback) {
            this.onDeathCallback(this.lives);
        }

        // Если жизни еще есть - респавним
        if (this.lives > 0) {
            this.respawn();
        }
    }

    respawn(): void {
        // Возвращаем игрока на начальную позицию
        this.pos_x = this.startX;
        this.pos_y = this.startY;

        // Включаем неуязвимость
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 0;

        // Сбрасываем движение
        this.move_x = 0;
        this.move_y = 0;
    }

    isAlive(): boolean {
        return this.lives > 0;
    }

    placeBomb(): void {
        if (!this.gameManager) {
            return;
        }

        // Проверяем, можно ли поставить еще одну бомбу
        if (this.activeBombs >= this.maxBombs) {
            return; // Достигнут лимит активных бомб
        }

        // Проверяем задержку установки бомбы
        const currentTime = Date.now();
        if (currentTime - this.lastBombTime < this.bombCooldown) {
            return; // Еще не прошло достаточно времени
        }

        // Вычисляем позицию бомбы - выравниваем по тайлу (16x16)
        // Используем центр персонажа для определения тайла
        const tileSize = 16;
        const centerX = this.pos_x + this.size_x / 2;
        const centerY = this.pos_y + this.size_y / 2;
        // Используем Math.floor для корректного выравнивания позиции к началу тайла
        const bombX = Math.floor(centerX / tileSize) * tileSize;
        const bombY = Math.floor(centerY / tileSize) * tileSize;

        // Проверяем, нет ли уже бомбы на этой позиции
        const bombExists = this.gameManager.entities.some((entity) => {
            return entity.pos_x === bombX && entity.pos_y === bombY;
        });

        if (!bombExists) {
            // Создаем новую бомбу с текущим радиусом взрыва
            const bomb = new Bomb(
                bombX,
                bombY,
                this.spriteManager,
                this.gameManager,
                this,
                2500,
                this.explosionRadius,
            );

            // Добавляем врагов, которые находятся на этой же клетке, в список passThroughEntities
            if (this.mainGameManager) {
                for (const entity of this.mainGameManager.entities) {
                    if (entity instanceof Enemy) {
                        const enemyCenterX = entity.pos_x + entity.size_x / 2;
                        const enemyCenterY = entity.pos_y + entity.size_y / 2;
                        const enemyTileX = Math.floor(enemyCenterX / tileSize);
                        const enemyTileY = Math.floor(enemyCenterY / tileSize);
                        const bombTileX = Math.floor(bombX / tileSize);
                        const bombTileY = Math.floor(bombY / tileSize);

                        if (enemyTileX === bombTileX && enemyTileY === bombTileY) {
                            bomb.passThroughEntities.add(entity);
                        }
                    }
                }
            }

            this.gameManager.entities.push(bomb);
            this.lastBombTime = currentTime; // Обновляем время последней установки
            this.activeBombs++; // Увеличиваем счетчик активных бомб

            // Воспроизводим звук установки бомбы
            if (this.mainGameManager?.soundManager) {
                this.mainGameManager.soundManager.play('/assets/sounds/PlaceBomb.wav', {
                    looping: false,
                    volume: 0.5,
                });
            }
        }
    }

    /**
     * Применяет бонус к игроку
     */
    applyBonus(bonusType: BonusType): void {
        console.log(
            `Applying bonus: ${bonusType}, current speed: ${this.speed}, maxBombs: ${this.maxBombs}, explosionRadius: ${this.explosionRadius}`,
        );
        switch (bonusType) {
            case 'Speed':
                if (!this.hasSpeedBonus) {
                    this.hasSpeedBonus = true;
                    this.speed = this.baseSpeed * 1.5; // +50% к скорости (более заметно)
                    console.log(`Bonus applied: Speed +50%, new speed: ${this.speed}`);
                }
                break;
            case 'FastBomb':
                if (!this.hasFastBombBonus) {
                    this.hasFastBombBonus = true;
                    this.maxBombs = 3; // Можно ставить до 3 бомб
                    console.log(`Bonus applied: Max bombs = ${this.maxBombs}`);
                }
                break;
            case 'BigBomb':
                if (!this.hasBigBombBonus) {
                    this.hasBigBombBonus = true;
                    this.explosionRadius = 2; // Увеличиваем радиус взрыва
                    console.log(`Bonus applied: Explosion radius = ${this.explosionRadius}`);
                }
                break;
        }
        console.log(
            `After bonus: speed: ${this.speed}, maxBombs: ${this.maxBombs}, explosionRadius: ${this.explosionRadius}`,
        );
    }

    /**
     * Сбрасывает все бонусы (вызывается при переходе на новый уровень)
     */
    resetBonuses(): void {
        this.hasSpeedBonus = false;
        this.hasFastBombBonus = false;
        this.hasBigBombBonus = false;
        this.speed = this.baseSpeed;
        this.maxBombs = 1;
        this.explosionRadius = 1;
        console.log('Bonuses reset');
    }
}
