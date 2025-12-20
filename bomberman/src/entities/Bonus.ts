import { Entity } from './';
import type { IDrawable } from './interfaces';

export class Bonus extends Entity implements IDrawable {
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'gold';
    }

    update(): void {}
}
