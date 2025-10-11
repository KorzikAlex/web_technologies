import {
    type colorType,
    TETROMINO_COLORS,
    TETROMINOES,
    type tetrominoMatrix,
    type tetrominoType
} from '../types'


export class Figure {
    private _shape: tetrominoMatrix;
    public get shape(): tetrominoMatrix {
        return this._shape;
    }

    private readonly _color: colorType;
    public get color(): colorType {
        return this._color;
    }

    private _x: number;
    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    private _y: number;
    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    private _cols: number;
    public get cols(): number {
        return this._shape.length;
    }

    private _rows: number;
    public get rows(): number {
        return this._shape[0]!.length;
    }

    constructor(type: tetrominoType) {
        this._shape = TETROMINOES[type];
        this._cols = this._shape.length;
        this._rows = this._shape[0]!.length;

        this._color = TETROMINO_COLORS[type];
        this._x = Math.floor((10 - this._shape[0]!.length) / 2);
        this._y = 0;
    }

    static random(): Figure {
        const types: tetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const randomType: tetrominoType = types[Math.floor(Math.random() * types.length)]!;
        return new Figure(randomType);
    }

    rotate(): void {
        const rotated: number[][] = Array.from({length: this._rows}, () => new Array(this._cols).fill(0));

        rotated.forEach((row: number[], j: number): void => {
            for (let i: number = 0; i < this._cols; i++) {
                row[i] = this._shape[i]?.[j] ?? 0;
            }
            row.reverse();
        });

        this._shape = rotated;
        this._cols = this._shape.length;
        this._rows = this._shape[0]!.length;
    }
}