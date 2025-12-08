/**
 * @file Figure.ts
 * @fileOverview Это файл содержит определение класса Figure, который представляет фигуру тетриса.
 * @author Korzik
 * @license MIT
 * @copyright 2025
 * @module Figure
 */

import {
    type colorType,
    TETROMINO_COLORS,
    TETROMINOES,
    type tetrominoMatrix,
    type tetrominoType
} from '../utils/types'
import {TETRIS_COLS} from "../utils/consts"; // Импорт типов и констант

/**
 * Класс Figure представляет фигуру тетриса.
 * @class Figure
 */
export class Figure {
    /**
     * Форма фигуры, представленная матрицей.
     * @private
     */
    private _shape: tetrominoMatrix;
    public get shape(): tetrominoMatrix {
        return this._shape;
    }

    /**
     * Цвет фигуры.
     * @private
     */
    private readonly _color: colorType;
    public get color(): colorType {
        return this._color;
    }

    /**
     * Позиция фигуры по оси X.
     * @private
     */
    private _x: number;
    /**
     * Получение позиции фигуры по оси X.
     */
    public get x(): number {
        return this._x;
    }

    /**
     * Установка позиции фигуры по оси X.
     * @param value
     */
    public set x(value: number) {
        this._x = value;
    }

    /**
     * Позиция фигуры по оси Y.
     * @private
     */
    private _y: number;
    /**
     * Получение позиции фигуры по оси Y.
     */
    public get y(): number {
        return this._y;
    }

    /**
     * Установка позиции фигуры по оси Y.
     * @param value
     */
    public set y(value: number) {
        this._y = value;
    }

    private _cols: number;
    public get cols(): number {
        return this._shape[0]!.length;
    }

    /**
     * Количество строк в фигуре.
     */
    private _rows: number;
    public get rows(): number {
        return this._shape.length;
    }

    /**
     * Создает экземпляр класса Figure.
     * @param type - Тип фигуры (один из 'I', 'O', 'T', 'S', 'Z', 'J', 'L').
     */
    constructor(type: tetrominoType) {
        this._shape = TETROMINOES[type];
        this._cols = this._shape.length;
        this._rows = this._shape[0]!.length;

        this._color = TETROMINO_COLORS[type];
        this._x = Math.floor((TETRIS_COLS - this._rows) / 2); // Центрирование фигуры по горизонтали на поле шириной 10
        this._y = 0;
    }

    /**
     * Создает и возвращает случайную фигуру.
     */
    static random(): Figure {
        const types: tetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']; // Все возможные типы фигур
        const randomType: tetrominoType = types[Math.floor(Math.random() * types.length)]!; // Выбор случайного типа
        return new Figure(randomType); // Создание и возврат новой фигуры
    }

    /**
     * Поворачивает фигуру по часовой стрелке.
     */
    rotate(): void {
        const rotated: number[][] = Array.from({length: this._rows}, () => new Array(this._cols).fill(0)); // Создание новой матрицы для повернутой фигуры

        // Заполнение новой матрицы повернутыми значениями
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

    /**
     * Клонирует текущий объект фигуры.
     * @returns {Figure}
     */
    clone(): Figure {
        const newFigure = new Figure('I');
        newFigure._shape = this._shape.map(row => [...row]);
        (newFigure as any)._color = this._color;
        newFigure._x = this._x;
        newFigure._y = this._y;
        newFigure._rows = this._rows;
        newFigure._cols = this._cols;
        return newFigure;
    }

    restore(other: Figure): void {
        this._shape = other._shape.map(row => [...row]);
        this._x = other._x;
        this._y = other._y;
        this._rows = other._rows;
        this._cols = other._cols;
    }

    equals(other: Figure): boolean {
        if (!other) {
            return false;
        }
        return this.matricesEqual(this._shape, other._shape);
    }

    private matricesEqual(a: number[][], b: number[][]): boolean {
        if (a.length !== b.length) return false;
        for (let i: number = 0; i < a.length; i++) {
            if (a[i]!.length !== b[i]!.length) return false;
            for (let j: number = 0; j < a[i]!.length; j++) {
                if (a[i]![j] !== b[i]![j]) return false;
            }
        }
        return true;
    }
}