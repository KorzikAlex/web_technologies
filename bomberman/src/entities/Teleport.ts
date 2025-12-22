import { Entity } from './';
import type { IDrawable, IHaveName } from './';
import type { SpriteManager, GameManager } from '@/managers';

export class Teleport extends Entity implements IDrawable, IHaveName {
    spriteManager: SpriteManager;
    gameManager: GameManager<Teleport>;
    name: string;
    isActive: boolean;
    animationFrame: number;
    animationTimer: number;

    constructor(
        x: number,
        y: number,
        spriteManager: SpriteManager,
        gameManager: GameManager<Teleport>,
    ) {
        super(x, y, 16, 16);
        this.spriteManager = spriteManager;
        this.gameManager = gameManager;
        this.name = 'Teleport';
        this.isActive = false; // Активируется когда врагов не останется
        this.animationFrame = 1;
        this.animationTimer = 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Рисуем телепорт как мерцающий портал
        // Если неактивен - затемнённый
        if (!this.isActive) {
            ctx.globalAlpha = 0.5;
        } else {
            // Эффект пульсации для активного телепорта
            const pulse = 0.7 + Math.sin(this.animationTimer * 0.01) * 0.3;
            ctx.globalAlpha = pulse;
        }

        // Рисуем портал (используем простой визуал, можно заменить на спрайт)
        const centerX = this.pos_x + this.size_x / 2;
        const centerY = this.pos_y + this.size_y / 2;
        const radius = 6;

        // Внешнее свечение
        const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius + 2,
        );
        if (this.isActive) {
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#0088ff');
            gradient.addColorStop(1, 'transparent');
        } else {
            gradient.addColorStop(0, '#444444');
            gradient.addColorStop(0.5, '#222222');
            gradient.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
        ctx.fill();

        // Внутренний круг
        ctx.fillStyle = this.isActive ? '#ffffff' : '#333333';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    update(): void {
        const deltaTime = 16.67; // ~60 FPS
        this.animationTimer += deltaTime;

        // Анимация вращения/пульсации
        if (this.animationTimer >= 100) {
            this.animationFrame++;
            if (this.animationFrame > 4) {
                this.animationFrame = 1;
            }
        }
    }

    /**
     * Активирует телепорт (когда все враги уничтожены)
     */
    activate(): void {
        this.isActive = true;
        console.log('Teleport activated!');
    }

    /**
     * Деактивирует телепорт
     */
    deactivate(): void {
        this.isActive = false;
    }

    /**
     * Проверяет, можно ли использовать телепорт
     */
    canUse(): boolean {
        return this.isActive;
    }
}
