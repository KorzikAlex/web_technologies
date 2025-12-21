import { Entity } from './';
import type { IDrawable, IHaveName } from './interfaces';
import type { SpriteManager, GameManager } from '@/managers';

export type ExplosionType = 'center' | 'horizontal' | 'vertical' | 'end_left' | 'end_right' | 'end_up' | 'end_down';

export class Explosion extends Entity implements IDrawable, IHaveName {
    spriteManager: SpriteManager;
    gameManager: GameManager<Explosion>;
    name: string;
    type: ExplosionType;
    timer: number;
    duration: number;
    animationFrame: number;
    animationTimer: number;

    constructor(
        x: number,
        y: number,
        spriteManager: SpriteManager,
        gameManager: GameManager<Explosion>,
        type: ExplosionType = 'center',
        duration: number = 500, // 500мс время жизни взрыва
    ) {
        super(x, y, 16, 16);
        this.spriteManager = spriteManager;
        this.gameManager = gameManager;
        this.name = 'Explosion';
        this.type = type;
        this.timer = 0;
        this.duration = duration;
        this.animationFrame = 1;
        this.animationTimer = 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Определяем имя спрайта в зависимости от типа взрыва
        let spriteName: string;
        switch (this.type) {
            case 'center':
                spriteName = 'explosion_center';
                break;
            case 'horizontal':
                spriteName = 'explosion_horizontal';
                break;
            case 'vertical':
                spriteName = 'explosion_vertical';
                break;
            case 'end_left':
                spriteName = 'explosion_end_left';
                break;
            case 'end_right':
                spriteName = 'explosion_end_right';
                break;
            case 'end_up':
                spriteName = 'explosion_end_up';
                break;
            case 'end_down':
                spriteName = 'explosion_end_down';
                break;
            default:
                spriteName = 'explosion_center';
        }

        // Эффект мерцания - меняем прозрачность
        const alpha = 0.7 + Math.sin(this.timer * 0.02) * 0.3;
        ctx.globalAlpha = alpha;
        this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
        ctx.globalAlpha = 1.0;
    }

    update(): void {
        const deltaTime = 16.67; // ~60 FPS
        this.timer += deltaTime;
        this.animationTimer += deltaTime;

        // Удаляем взрыв после окончания времени жизни
        if (this.timer >= this.duration) {
            this.gameManager.kill(this);
        }
    }
}
