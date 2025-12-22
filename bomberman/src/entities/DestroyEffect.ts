import { Entity, type IDrawable, type IHaveName } from './';
import { SpriteManager, GameManager } from '@/managers';

/**
 * Эффект разрушения препятствия
 */
export class DestroyEffect extends Entity implements IDrawable, IHaveName {
    spriteManager: SpriteManager;
    gameManager: GameManager<DestroyEffect>;
    name: string;
    timer: number;
    duration: number;
    animationFrame: number;
    animationTimer: number;
    readonly maxFrames: number = 6;
    readonly animationSpeed: number;

    constructor(
        x: number,
        y: number,
        spriteManager: SpriteManager,
        gameManager: GameManager<DestroyEffect>,
        duration: number = 400, // 400мс время жизни эффекта
    ) {
        super(x, y, 16, 16);
        this.spriteManager = spriteManager;
        this.gameManager = gameManager;
        this.name = 'DestroyEffect';
        this.timer = 0;
        this.duration = duration;
        this.animationFrame = 1;
        this.animationTimer = 0;
        this.animationSpeed = duration / this.maxFrames;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const spriteName = `obstacle_destroy_${this.animationFrame}`;
        this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
    }

    update(): void {
        const deltaTime = 16.67; // ~60 FPS
        this.timer += deltaTime;
        this.animationTimer += deltaTime;

        // Обновляем кадр анимации
        if (this.animationTimer >= this.animationSpeed && this.animationFrame < this.maxFrames) {
            this.animationTimer = 0;
            this.animationFrame++;
        }

        // Удаляем эффект после окончания времени жизни
        if (this.timer >= this.duration) {
            this.gameManager.kill(this);
        }
    }
}
