import type { SpriteManager } from '@/managers';
import { Entity } from './Entity';
import type { IDrawable, IInteractEntity } from './interfaces/';

export class Player extends Entity implements IDrawable, IInteractEntity {
    lifetime: number;
    move_x: number;
    move_y: number;
    speed: number;
    spriteManager: SpriteManager;

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

        this.lifetime = lifetime;
        this.move_x = move_x;
        this.move_y = move_y;
        this.speed = speed;
        this.spriteManager = spriteManager;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.spriteManager.drawSprite(ctx, 'player_down_1', this.pos_x, this.pos_y);
    }

    update(): void {
        // TODO: реализовать обновление состояния игрока
    }

    onTouchEntity<T extends Entity>(obj: T): void {
        // TODO: реализовать взаимодействие с объектами
    }

    kill(): void {
        // TODO: реализовать смерть игрока
    }

    placeBomb(): void {
        // TODO: реализовать установку бомбы
    }
}
