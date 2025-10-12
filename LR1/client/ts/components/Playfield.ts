/**
 * @file Playfield.ts
 * @fileOverview Этот файл содержит определение класса Playfield, который представляет игровое поле тетриса.
 * @author Korzik
 * @license MIT
 * @copyright 2025
 * @module Playfield
 */
import {Figure} from "./Figure"; // Импорт класса Figure
import type {tetrominoMatrix} from "../types"; // Импорт типа tetrominoMatrix
import {Cell} from "./Cell"; // Импорт класса Cell
import {TETRIS_COLS, TETRIS_ROWS} from "../utils/utils"; // Импорт констант

/**
 * Класс Playfield представляет игровое поле тетриса.
 * @class Playfield
 */
export class Playfield {
    /**
     * Количество строк в игровом поле.
     * @private
     */
    private readonly _rows: number;
    /**
     * Количество столбцов в игровом поле.
     * @returns {number}
     */
    public get rows(): number {
        return this._rows;
    }

    /**
     * Количество столбцов в игровом поле.
     * @private
     */
    private readonly _cols: number;
    /**
     * Количество столбцов в игровом поле.
     * @returns {number}
     */
    public get cols(): number {
        return this._cols;
    }

    /**
     * Сетка игрового поля, состоящая из ячеек.
     * @private
     */
    private _grid: Cell[][];
    /**
     * Сетка игрового поля, состоящая из ячеек.
     */
    public get grid(): Cell[][] {
        return this._grid;
    }

    /**
     * Создает экземпляр игрового поля.
     * @param rows
     * @param cols
     */
    constructor(rows = TETRIS_ROWS, cols = TETRIS_COLS) {
        this._rows = rows
        this._cols = cols
        this._grid = this.createGrid()
    }

    /**
     * Создает сетку игрового поля.
     * @private
     */
    private createGrid(): Cell[][] {
        // Исправлено: строки - вертикаль, столбцы - горизонталь
        return Array.from({length: this._rows}, () => Array.from({length: this._cols}, () => new Cell(false, "none")));
    }

    /**
     * Размещает фигуру на игровом поле.
     * @param figure
     */
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

    /**
     * Проверяет, является ли позиция фигуры допустимой на игровом поле.
     * @param figure - фигура для проверки
     * @param offsetX - смещение по оси X
     * @param offsetY - смещение по оси Y
     */
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

    /**
     * Очищает заполненные линии на игровом поле и возвращает количество очищенных линий.
     * @returns {number} - количество очищенных линий
     */
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

    /**
     * Очищает игровое поле, сбрасывая все ячейки в начальное состояние.
     */
    clear(): void {
        this._grid = this.createGrid()
    }
}
