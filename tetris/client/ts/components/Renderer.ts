import {TETRIS_BLOCK_SIZE} from "../utils/consts";

export abstract class Renderer<T = void> implements IRenderer {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected cellSize: number;

    protected constructor(canvas: HTMLCanvasElement, cellSize: number = TETRIS_BLOCK_SIZE) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.cellSize = cellSize;
    }

    protected drawCell(x: number, y: number, size: number, fill_color: string, stroke_color: string): void {
        this.ctx.fillStyle = fill_color;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.strokeStyle = stroke_color;
        this.ctx.strokeRect(x, y, size, size);
    }

    abstract render(arg?: T): void;
}

export interface IRenderer {
    render(): void;
}