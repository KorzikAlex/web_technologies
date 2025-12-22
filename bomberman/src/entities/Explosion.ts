import { Entity } from './';
import type { IDrawable, IHaveName } from './';
import type { SpriteManager, GameManager } from '@/managers';

export type ExplosionType =
    | 'center'
    | 'horizontal'
    | 'vertical'
    | 'end_left'
    | 'end_right'
    | 'end_up'
    | 'end_down';

export class Explosion extends Entity implements IDrawable, IHaveName {
    spriteManager: SpriteManager;
    gameManager: GameManager<Explosion>;
    name: string;
    type: ExplosionType;
    timer: number;
    duration: number;
    animationFrame: number;
    animationTimer: number;
    readonly maxFrames: number = 5;
    readonly animationSpeed: number; // мс между кадрами

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
        this.animationSpeed = duration / this.maxFrames; // Равномерно распределяем кадры по времени жизни
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Определяем базовое имя спрайта и нужна ли инверсия
        let baseSpriteName: string;
        let flipX = false;
        let flipY = false;

        switch (this.type) {
            case 'center':
                baseSpriteName = 'explosion_center';
                break;
            case 'horizontal':
                baseSpriteName = 'explosion_horizontal';
                break;
            case 'vertical':
                baseSpriteName = 'explosion_vertical';
                break;
            case 'end_left':
                // Используем end_right и инвертируем по X
                baseSpriteName = 'explosion_end_right';
                flipX = true;
                break;
            case 'end_right':
                baseSpriteName = 'explosion_end_right';
                break;
            case 'end_up':
                // Используем end_down и инвертируем по Y
                baseSpriteName = 'explosion_end_down';
                flipY = true;
                break;
            case 'end_down':
                baseSpriteName = 'explosion_end_down';
                break;
            default:
                baseSpriteName = 'explosion_center';
        }

        const spriteName = `${baseSpriteName}_${this.animationFrame}`;

        if (flipX || flipY) {
            ctx.save();
            if (flipX && flipY) {
                ctx.translate(this.pos_x + this.size_x, this.pos_y + this.size_y);
                ctx.scale(-1, -1);
            } else if (flipX) {
                ctx.translate(this.pos_x + this.size_x, this.pos_y);
                ctx.scale(-1, 1);
            } else if (flipY) {
                ctx.translate(this.pos_x, this.pos_y + this.size_y);
                ctx.scale(1, -1);
            }
            this.spriteManager.drawSprite(ctx, spriteName, 0, 0);
            ctx.restore();
        } else {
            this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
        }
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

        // Удаляем взрыв после окончания времени жизни
        if (this.timer >= this.duration) {
            this.gameManager.kill(this);
        }
    }
}
