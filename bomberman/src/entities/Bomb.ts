import { Entity } from './';
import type { IDrawable } from './interfaces';
import type { SpriteManager, GameManager, MapManager } from '@/managers';
import type { Player } from './Player';
import { Obstacle } from './Obstacle';
import { Explosion } from './Explosion';
import type { ExplosionType } from './Explosion';

export class Bomb extends Entity implements IDrawable {
    spriteManager: SpriteManager;
    gameManager: GameManager<Bomb>;
    player: Player;
    timer: number;
    explosionTime: number;
    animationFrame: number;
    animationTimer: number;

    constructor(
        x: number,
        y: number,
        spriteManager: SpriteManager,
        gameManager: GameManager<Bomb>,
        player: Player,
        explosionTime: number = 2500, // 2.5 секунды в миллисекундах
    ) {
        super(x, y, 16, 16);
        this.spriteManager = spriteManager;
        this.gameManager = gameManager;
        this.player = player;
        this.timer = 0;
        this.explosionTime = explosionTime;
        this.animationFrame = 1;
        this.animationTimer = 0;
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
        // Радиус взрыва (в тайлах)
        const explosionRadius = 2; // 2 тайла в каждую сторону
        const tileSize = 16;

        // Находим и уничтожаем препятствия в радиусе взрыва
        const bombTileX = Math.floor(this.pos_x / tileSize);
        const bombTileY = Math.floor(this.pos_y / tileSize);

        // Получаем MapManager для проверки стен
        const mapManager = this.gameManager.mapManager;

        // Создаём взрыв в центре (всегда)
        this.createExplosion(bombTileX * tileSize, bombTileY * tileSize, 'center');

        // Взрыв влево
        this.createExplosionLine(bombTileX, bombTileY, -1, 0, explosionRadius, 'horizontal', 'end_left', mapManager, tileSize);

        // Взрыв вправо
        this.createExplosionLine(bombTileX, bombTileY, 1, 0, explosionRadius, 'horizontal', 'end_right', mapManager, tileSize);

        // Взрыв вверх
        this.createExplosionLine(bombTileX, bombTileY, 0, -1, explosionRadius, 'vertical', 'end_up', mapManager, tileSize);

        // Взрыв вниз
        this.createExplosionLine(bombTileX, bombTileY, 0, 1, explosionRadius, 'vertical', 'end_down', mapManager, tileSize);

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
        tileSize: number
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
                const bonusType = obstacle.destroy();
                if (bonusType > 0) {
                    console.log(`Bonus dropped: ${bonusType} at (${obstacle.pos_x}, ${obstacle.pos_y})`);
                }
                // Используем mainGameManager для удаления препятствия из правильного списка
                if (this.player.mainGameManager) {
                    this.player.mainGameManager.killEntity(obstacle);
                }
                break; // Взрыв останавливается на препятствии
            }
        }
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
                x, y,
                this.spriteManager,
                this.player.explosionGameManager,
                type,
                500 // Время жизни взрыва 500мс
            );
            this.player.explosionGameManager.entities.push(explosion);
        }
    }
}
