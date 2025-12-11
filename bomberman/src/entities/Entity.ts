export class Entity {
    pos_x: number;
    pos_y: number;
    size_x: number;
    size_y: number;

    constructor(x: number = 0, y: number = 0, size_x: number = 0, size_y: number = 0) {
        this.pos_x = x;
        this.pos_y = y;

        this.size_x = size_x;
        this.size_y = size_y;
    }

    draw(ctx: CanvasRenderingContext2D): void {}
}
