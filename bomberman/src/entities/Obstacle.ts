import { Entity } from './';
import type { IDrawable, IHaveName } from './interfaces';
import type { SpriteManager } from '@/managers';

export class Obstacle extends Entity implements IDrawable, IHaveName {
    spriteManager: SpriteManager;
    health: number;
    name: string;

    constructor(
        x: number,
        y: number,
        spriteManager: SpriteManager,
    ) {
        super(x, y, 16, 16);
        this.spriteManager = spriteManager;
        this.health = 1; // Разрушается с одного взрыва
        this.name = 'Obstacle';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Отрисовываем спрайт разрушаемого блока из тайлсета PeaceTown
        const sprite = this.spriteManager.getSprite('obstacle');
        if (!sprite) {
            // Если спрайт не найден, рисуем коричневый квадрат как заглушку
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.pos_x, this.pos_y, 16, 16);
            ctx.strokeStyle = '#654321';
            ctx.strokeRect(this.pos_x, this.pos_y, 16, 16);
            return;
        }
        this.spriteManager.drawSprite(ctx, 'obstacle', this.pos_x, this.pos_y);
    }

    update(): void {
        // Препятствия статичны, не требуют обновления
    }

    destroy(forceDropType?: number): number {
        // Возвращает тип выпавшего бонуса:
        // 0 - ничего
        // 1 - скорость
        // 2 - больше бомб
        // 3 - мощнее взрыв
        // 4 - портал

        // Если передан принудительный тип - возвращаем его
        if (forceDropType !== undefined) {
            return forceDropType;
        }

        const random = Math.random();

        if (random < 0.05) {
            // 5% шанс выпадения бонуса скорости
            return 1;
        } else if (random < 0.10) {
            // 5% шанс выпадения бонуса на количество бомб
            return 2;
        } else if (random < 0.15) {
            // 5% шанс выпадения бонуса на мощность взрыва
            return 3;
        } else if (random < 0.18) {
            // 3% шанс выпадения портала
            return 4;
        }

        return 0; // 82% ничего не выпадает
    }
}
