import type {Playfield} from "./Playfield";
import {Renderer} from "./Renderer";
import type {Figure} from "./Figure";

export class PlayfieldRenderer extends Renderer<Figure> {
    private playfield: Playfield;
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(canvas: HTMLCanvasElement, playfield: Playfield, cellSize: number) {
        super(canvas, cellSize);
        this.playfield = playfield;
        this.offsetX = (canvas.width - playfield.cols * cellSize) / 2;
        this.offsetY = (canvas.height - playfield.rows * cellSize) / 2;
    }

    private renderGrid(): void {
        for (let y: number = 0; y < this.playfield.rows; y++) {
            for (let x: number = 0; x < this.playfield.cols; x++) {
                this.drawCell(
                    this.offsetX + x * this.cellSize,
                    this.offsetY + y * this.cellSize,
                    this.cellSize,
                    "black",
                    "lightgray"
                );
            }
        }
    }

    private renderExistingFigures(): void {
        for (let y: number = 0; y < this.playfield.rows; y++) {
            for (let x: number = 0; x < this.playfield.cols; x++) {
                if (this.playfield.grid[y]![x]) {
                    this.drawCell(
                        this.offsetX + x * this.cellSize,
                        this.offsetY + y * this.cellSize,
                        this.cellSize,
                        this.playfield.grid[y]![x]!.color,
                        "black");
                }
            }
        }
    }

    private renderCurrentFigure(currentFigure: Figure): void {
        for (let y: number = 0; y < currentFigure.cols; y++) {
            for (let x: number = 0; x < currentFigure.rows; x++) {
                if (currentFigure.shape[y]![x]) {
                    this.drawCell(
                        this.offsetX + (currentFigure.x + x) * this.cellSize,
                        this.offsetY + (currentFigure.y + y) * this.cellSize,
                        this.cellSize,
                        currentFigure.color,
                        "black");
                }
            }
        }
    }

    render(currentFigure: Figure): void {
        this.renderGrid()
        this.renderExistingFigures()
        this.renderCurrentFigure(currentFigure)
    }
}

