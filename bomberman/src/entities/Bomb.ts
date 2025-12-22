import { Entity, Obstacle, Bonus, Teleport, Explosion, Player, DestroyEffect } from './';
import type { IDrawable, BonusType, ExplosionType } from './';
import type { SpriteManager, GameManager, MapManager } from '@/managers';
import { SCORE_DESTROY_OBSTACLE } from '@/managers/GameManager';

export class Bomb extends Entity implements IDrawable {
    spriteManager: SpriteManager;
    gameManager: GameManager<Bomb>;
    player: Player;
    timer: number;
    explosionTime: number;
    explosionRadius: number;
    animationFrame: number;
    animationTimer: number;

    // Система прохождения через бомбу
    // Сущности, которые находились на бомбе при её установке, могут проходить через неё
    passThroughEntities: Set<Entity>;

    constructor(
        x: number,
        y: number,
        spriteManager: SpriteManager,
        gameManager: GameManager<Bomb>,
        player: Player,
        explosionTime: number = 2500, // 2.5 секунды в миллисекундах
        explosionRadius: number = 1, // Радиус взрыва в тайлах
    ) {
        super(x, y, 16, 16);
        this.spriteManager = spriteManager;
        this.gameManager = gameManager;
        this.player = player;
        this.timer = 0;
        this.explosionTime = explosionTime;
        this.explosionRadius = explosionRadius;
        this.animationFrame = 1;
        this.animationTimer = 0;

        // Изначально игрок, поставивший бомбу, может проходить через неё
        this.passThroughEntities = new Set<Entity>();
        this.passThroughEntities.add(player);
    }

    /**
     * Проверяет, может ли сущность пройти через эту бомбу
     */
    canPassThrough(entity: Entity): boolean {
        return this.passThroughEntities.has(entity);
    }

    /**
     * Убирает сущность из списка тех, кто может проходить через бомбу
     * Вызывается когда сущность покидает клетку с бомбой
     */
    removePassThrough(entity: Entity): void {
        this.passThroughEntities.delete(entity);
    }

    /**
     * Проверяет, находится ли сущность на той же клетке, что и бомба
     */
    isEntityOnBomb(entity: Entity): boolean {
        const tileSize = 16;
        const bombTileX = Math.floor(this.pos_x / tileSize);
        const bombTileY = Math.floor(this.pos_y / tileSize);

        const entityCenterX = entity.pos_x + entity.size_x / 2;
        const entityCenterY = entity.pos_y + entity.size_y / 2;
        const entityTileX = Math.floor(entityCenterX / tileSize);
        const entityTileY = Math.floor(entityCenterY / tileSize);

        return bombTileX === entityTileX && bombTileY === entityTileY;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Анимация бомбы - переключение между bomb_1, bomb_2, bomb_3, bomb_4
        const spriteName = `bomb_${this.animationFrame}`;
        this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
    }

    update(): void {
        // Обновление таймера
        const deltaTime = 16.67; // Примерно 60 FPS (~16.67 мс на кадр)
        this.timer += deltaTime;
        this.animationTimer += deltaTime;

        // Анимация бомбы (меняем кадры каждые 200 мс)
        if (this.animationTimer >= 200) {
            this.animationTimer = 0;
            this.animationFrame++;
            if (this.animationFrame > 4) {
                this.animationFrame = 1;
            }
        }

        // Проверка времени взрыва
        if (this.timer >= this.explosionTime) {
            this.explode();
        }
    }

    explode(): void {
        // Радиус взрыва (в тайлах) - берём из параметра бомбы
        const explosionRadius = this.explosionRadius;
        const tileSize = 16;

        // Воспроизводим звук взрыва
        if (this.player.mainGameManager?.soundManager) {
            this.player.mainGameManager.soundManager.playWorldSound(
                '/assets/sounds/BombExplode.wav',
                this.pos_x,
                this.pos_y,
            );
        }

        // Находим и уничтожаем препятствия в радиусе взрыва
        const bombTileX = Math.floor(this.pos_x / tileSize);
        const bombTileY = Math.floor(this.pos_y / tileSize);

        // Получаем MapManager для проверки стен
        const mapManager = this.gameManager.mapManager;

        // Создаём взрыв в центре (всегда)
        this.createExplosion(bombTileX * tileSize, bombTileY * tileSize, 'center');

        // Взрыв влево
        this.createExplosionLine(
            bombTileX,
            bombTileY,
            -1,
            0,
            explosionRadius,
            'horizontal',
            'end_left',
            mapManager,
            tileSize,
        );

        // Взрыв вправо
        this.createExplosionLine(
            bombTileX,
            bombTileY,
            1,
            0,
            explosionRadius,
            'horizontal',
            'end_right',
            mapManager,
            tileSize,
        );

        // Взрыв вверх
        this.createExplosionLine(
            bombTileX,
            bombTileY,
            0,
            -1,
            explosionRadius,
            'vertical',
            'end_up',
            mapManager,
            tileSize,
        );

        // Взрыв вниз
        this.createExplosionLine(
            bombTileX,
            bombTileY,
            0,
            1,
            explosionRadius,
            'vertical',
            'end_down',
            mapManager,
            tileSize,
        );

        // Уменьшаем счетчик активных бомб у игрока
        if (this.player.activeBombs > 0) {
            this.player.activeBombs--;
        }

        // Удаляем бомбу
        this.gameManager.kill(this);
    }

    /**
     * Создаёт линию взрыва в указанном направлении, останавливаясь на стенах
     */
    private createExplosionLine(
        startTileX: number,
        startTileY: number,
        dirX: number,
        dirY: number,
        radius: number,
        midType: ExplosionType,
        endType: ExplosionType,
        mapManager: MapManager | null,
        tileSize: number,
    ): void {
        const FLAGS_MASK = 0x80000000 | 0x40000000 | 0x20000000;

        for (let i = 1; i <= radius; i++) {
            const tileX = startTileX + dirX * i;
            const tileY = startTileY + dirY * i;
            const worldX = tileX * tileSize;
            const worldY = tileY * tileSize;

            // Проверяем, есть ли стена на этой позиции
            if (mapManager) {
                const wallTileIdx = mapManager.getTilesetIdx(worldX, worldY, 'walls') & ~FLAGS_MASK;
                if (wallTileIdx !== 0) {
                    // Стена - останавливаем взрыв в этом направлении
                    break;
                }
            }

            // Проверяем, есть ли разрушаемый объект на этой позиции
            const obstacle = this.findObstacleAt(tileX, tileY, tileSize);

            // Определяем тип взрыва
            const type: ExplosionType = i === radius ? endType : midType;

            // Создаём взрыв
            this.createExplosion(worldX, worldY, type);

            // Если есть препятствие - уничтожаем его и останавливаем взрыв
            if (obstacle) {
                // Проверяем, нужно ли гарантированно выдать телепорт
                const shouldForceTeleport = this.shouldForceTeleportDrop(obstacle);
                const bonusType = obstacle.destroy(shouldForceTeleport ? 4 : undefined);

                // Начисляем очки за уничтожение препятствия
                if (this.player.mainGameManager) {
                    this.player.mainGameManager.addScore(SCORE_DESTROY_OBSTACLE);
                }

                if (bonusType > 0) {
                    console.log(
                        `Bonus dropped: ${bonusType} at (${obstacle.pos_x}, ${obstacle.pos_y})`,
                    );

                    // Создаём соответствующий бонус
                    switch (bonusType) {
                        case 1:
                            this.createBonus(obstacle.pos_x, obstacle.pos_y, 'Speed');
                            break;
                        case 2:
                            this.createBonus(obstacle.pos_x, obstacle.pos_y, 'FastBomb');
                            break;
                        case 3:
                            this.createBonus(obstacle.pos_x, obstacle.pos_y, 'BigBomb');
                            break;
                        case 4:
                            this.createTeleport(obstacle.pos_x, obstacle.pos_y);
                            break;
                    }
                }

                // Создаём эффект разрушения на месте препятствия
                this.createDestroyEffect(obstacle.pos_x, obstacle.pos_y);

                // Используем mainGameManager для удаления препятствия из правильного списка
                if (this.player.mainGameManager) {
                    this.player.mainGameManager.killEntity(obstacle);
                }
                break; // Взрыв останавливается на препятствии
            }
        }
    }

    /**
     * Проверяет, нужно ли гарантированно выдать телепорт при уничтожении препятствия
     * @returns true если это последнее препятствие и телепорт ещё не появился
     */
    private shouldForceTeleportDrop(currentObstacle: Obstacle): boolean {
        // Если телепорт уже есть - не нужно
        if (
            this.player.teleportGameManager &&
            this.player.teleportGameManager.entities.length > 0
        ) {
            return false;
        }

        // Считаем количество оставшихся препятствий (включая текущее)
        if (!this.player.mainGameManager) {
            return false;
        }

        let obstacleCount = 0;
        for (const entity of this.player.mainGameManager.entities) {
            if (entity instanceof Obstacle) {
                obstacleCount++;
            }
        }

        // Также проверяем laterKill (препятствия, которые уже помечены на удаление)
        for (const entity of this.player.mainGameManager.laterKill) {
            if (entity instanceof Obstacle && entity !== currentObstacle) {
                obstacleCount--;
            }
        }

        // Если это последнее препятствие - гарантированно выдаём телепорт
        return obstacleCount <= 1;
    }

    /**
     * Находит препятствие на указанной позиции тайла
     */
    private findObstacleAt(tileX: number, tileY: number, tileSize: number): Obstacle | null {
        // Ищем в основном GameManager, где хранятся препятствия
        if (!this.player.mainGameManager) {
            return null;
        }

        for (const entity of this.player.mainGameManager.entities) {
            if (entity instanceof Obstacle) {
                const entityTileX = Math.floor(entity.pos_x / tileSize);
                const entityTileY = Math.floor(entity.pos_y / tileSize);
                if (entityTileX === tileX && entityTileY === tileY) {
                    return entity;
                }
            }
        }
        return null;
    }

    private createExplosion(x: number, y: number, type: ExplosionType): void {
        // Используем explosionGameManager игрока для создания взрывов
        if (this.player.explosionGameManager) {
            const explosion = new Explosion(
                x,
                y,
                this.spriteManager,
                this.player.explosionGameManager,
                type,
                500, // Время жизни взрыва 500мс
            );
            this.player.explosionGameManager.entities.push(explosion);
        }
    }

    private createTeleport(x: number, y: number): void {
        // Используем teleportGameManager игрока для создания телепорта
        if (this.player.teleportGameManager) {
            // Проверяем, есть ли уже телепорт на карте
            if (this.player.teleportGameManager.entities.length > 0) {
                console.log('Teleport already exists on the map');
                return;
            }

            const teleport = new Teleport(
                x,
                y,
                this.spriteManager,
                this.player.teleportGameManager,
            );
            this.player.teleportGameManager.entities.push(teleport);
            console.log(`Teleport created at (${x}, ${y})`);
        }
    }

    private createBonus(x: number, y: number, bonusType: BonusType): void {
        // Используем bonusGameManager игрока для создания бонуса
        if (this.player.bonusGameManager) {
            const bonus = new Bonus(
                x,
                y,
                bonusType,
                this.spriteManager,
                this.player.bonusGameManager,
            );
            this.player.bonusGameManager.entities.push(bonus);
            console.log(`Bonus created: ${bonusType} at (${x}, ${y})`);
        }
    }

    private createDestroyEffect(x: number, y: number): void {
        // Используем explosionGameManager для эффектов разрушения
        if (this.player.explosionGameManager) {
            const effect = new DestroyEffect(
                x,
                y,
                this.spriteManager,
                this.player.explosionGameManager,
            );
            this.player.explosionGameManager.entities.push(effect);
        }
    }
}
