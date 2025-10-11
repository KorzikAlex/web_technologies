import {Figure} from "./Figure";
import type {colorType, tetrominoMatrix} from "../types";
import {Cell} from "./Cell";

export class Playfield {
    private readonly _rows: number;
    public get rows(): number {
        return this._rows;
    }

    private readonly _cols: number;
    public get cols(): number {
        return this._cols;
    }

    private _grid: Cell[][];
    public get grid(): Cell[][] {
        return this._grid;
    }

    constructor(rows = 10, cols = 20) {
        this._rows = rows
        this._cols = cols
        this._grid = this.createGrid()
    }

    private createGrid(): Cell[][] {
        // Исправлено: строки - вертикаль, столбцы - горизонталь
        return Array.from({length: this._rows}, () => Array.from({length: this._cols}, () => new Cell(false, "none")));
    }

    placeFigure(figure: Figure): void {
        for (let y: number = 0; y < figure.cols; ++y) {
            for (let x: number = 0; x < figure.rows; ++x) {
                if (figure.shape[y]![x] && figure.y + y >= 0) {
                    this._grid[figure.y + y]![figure.x + x]!.color = figure.color;
                    this._grid[figure.y + y]![figure.x + x]!.state = true;
                }
            }
        }
    }

    isValidPosition(figure: Figure, offsetX: number = 0, offsetY: number = 0): boolean {
        const shape: tetrominoMatrix = figure.shape;
        for (let y: number = 0; y < figure.cols; ++y) {
            for (let x: number = 0; x < figure.rows; ++x) {
                if (shape[y]![x]) {
                    let nx: number = figure.x + x + offsetX;
                    let ny: number = figure.y + y + offsetY;
                    if (nx < 0 || nx >= this._cols || ny >= this._rows) return true;
                    if (ny >= 0 && this._grid[ny]![nx]!.state) return true;
                }
            }
        }
        return false
    }

    clearLines(): number {
        let cleared: number = 0;
        for (let y: number = this._rows - 1; y >= 0; --y) {
            if (this._grid[y]!.every(cell => cell.state)) {
                this._grid.splice(y, 1);
                this._grid.unshift(Array.from({length: this._cols}, () => new Cell(false, "none")));
                cleared++;
                y++;
            }
        }
        return cleared;
    }

    clear() {
        this._grid = this.createGrid()
    }
}
