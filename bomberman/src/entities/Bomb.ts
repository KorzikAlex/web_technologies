import { Entity } from './';
import type { IDrawable } from './interfaces';
import type { SpriteManager, GameManager } from '@/managers';
import type { Player } from './Player';

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
        // TODO: Реализовать создание взрыва и повреждение окружающих объектов
        // Уменьшаем счетчик активных бомб у игрока
        if (this.player.activeBombs > 0) {
            this.player.activeBombs--;
        }
        // Удаляем бомбу
        this.gameManager.kill(this);
    }
}
