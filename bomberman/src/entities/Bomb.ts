import { Entity } from './';
import type { IDrawable } from './interfaces';

export class Bomb extends Entity implements IDrawable {
    draw(ctx: CanvasRenderingContext2D): void {}

    update(): void {}
}
