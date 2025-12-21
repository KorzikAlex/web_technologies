import type { SpriteManager, PhysicsManager, GameManager } from '@/managers';
import { Entity } from './Entity';
import { Bomb } from './Bomb';
import type { Explosion } from './Explosion';
import type { IDrawable, IInteractEntity, IMovable, IHaveName, IInteractMap } from './interfaces/';

export class Player extends Entity implements IDrawable, IInteractEntity, IMovable, IHaveName, IInteractMap {
    name: string;
    lifetime: number;
    move_x: number;
    move_y: number;
    speed: number;
    spriteManager: SpriteManager;
    physicsManager: PhysicsManager<Player> | null;
    gameManager: GameManager<Bomb> | null;
    explosionGameManager: GameManager<Explosion> | null;
    mainGameManager: GameManager<Entity & IDrawable> | null;
    lastBombTime: number;
    bombCooldown: number;
    maxBombs: number;
    activeBombs: number;

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
        this.mainGameManager = null;
        this.lastBombTime = 0;
        this.bombCooldown = 300; // Задержка 300мс между установками бомб
        this.maxBombs = 1; // По умолчанию можно ставить только 1 бомбу
        this.activeBombs = 0; // Количество активных бомб
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Отрисовываем спрайт игрока
        this.spriteManager.drawSprite(ctx, 'player_down_1', this.pos_x, this.pos_y);
    }

    update(): void {
        // Используем PhysicsManager для обновления позиции
        if (this.physicsManager && (this.move_x !== 0 || this.move_y !== 0)) {
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
        // TODO: реализовать смерть игрока
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
            // Создаем новую бомбу
            const bomb = new Bomb(bombX, bombY, this.spriteManager, this.gameManager, this);
            this.gameManager.entities.push(bomb);
            this.lastBombTime = currentTime; // Обновляем время последней установки
            this.activeBombs++; // Увеличиваем счетчик активных бомб
        }
    }
}
