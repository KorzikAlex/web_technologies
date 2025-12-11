import { Entity } from './Entity';

export class Player extends Entity {
    lifetime: number;
    move_x: number;
    move_y: number;
    speed: number;

    constructor(x: number = 0, y: number = 0, size_x: number = 0, size_y: number = 0) {
        super(x, y, size_x, size_y);
        this.lifetime = 100;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 2;
    }

    draw(ctx: CanvasRenderingContext2D) {}

    update(): void {
        PhysicsManager.update(this);
    }

    kill(): void {}

    fire(): void {}
}
