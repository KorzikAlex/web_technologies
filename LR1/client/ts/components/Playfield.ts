import {Figure} from "./Figure";

export class Playfield {
    private readonly _rows: number;
    public get rows(): number {
        return this._rows;
    }

    private readonly _cols: number;
    public get cols(): number {
        return this._cols;
    }

    private readonly _grid: number[][];
    public get grid(): number[][] {
        return this._grid;
    }

    constructor(rows = 10, cols = 22) {
        this._rows = rows
        this._cols = cols
        this._grid = this.createGrid()
    }

    private createGrid(): number[][] {
        const grid: number[][] = []
        for (let y: number = 0; y < this._rows; ++y) {
            grid[y] = []
            for (let x: number = 0; x < this._cols; ++y) {
                grid?[y][x] = 0;
            }
        }
        return grid
    }

    clearLines(): number {
        return 0
    }

    placeFigure(figure: Figure): void {
    }
}