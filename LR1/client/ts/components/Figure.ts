import {
    type colorType,
    TETROMINO_COLORS,
    TETROMINOES,
    type TetrominoMatrix,
    type TetrominoType
} from '../settings'

import type {IRotatable} from './ShapeProperties';

export class Figure implements IRotatable {
    private _shape: TetrominoMatrix;
    public get shape(): TetrominoMatrix {
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

    constructor(type: TetrominoType) {
        this._shape = TETROMINOES[type];
        this._color = TETROMINO_COLORS[type];
        this._x = Math.floor((10 - this._shape[0]!.length) / 2);
        this._y = 0;
    }

    random(): Figure {
        const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const randomType: TetrominoType = types[Math.floor(Math.random() * types.length)]!;
        return new Figure(randomType);
    }

    rotate(): void {
        const rows: number = this.shape.length;
        const cols: number = this.shape[0]!.length; // Используем оператор ! для доступа к длине
        const rotated: number[][] = [];

        for (let j: number = 0; j < cols; ++j) {
            rotated[j] = [];
            for (let i: number = 0; i < rows; ++i) {
                rotated [j][i] = this._shape[i][j];
            }
        }

        // Отражаем каждую строку по горизонтали
        for (let i: number = 0; i < rotated.length; i++) {
            rotated[i]?.reverse();
        }

        this._shape = rotated;
    }
}