/**
 * @file Cell.ts
 * @author KorzikAlex
 * @description Класс, представляющий ячейку в сетке.
 * @version 1.0
 * @copyright 2025
 * @license MIT
 */
import type {colorType} from "../types";

/**
 * Класс, представляющий ячейку в сетке.
 */
export class Cell {
    /**
     * Состояние ячейки.
     * @private
     */
    private _state: boolean = false;
    /**
     * Состояние ячейки (активна или нет).
     */
    public get state(): boolean {
        return this._state;
    }

    /**
     * Установка состояния ячейки.
     * @param value
     */
    public set state(value: boolean) {
        this._state = value;
    }

    /**
     * Цвет ячейки.
     * @private
     */
    private _color: colorType;
    /**
     * Цвет ячейки.
     */
    public get color(): colorType {
        return this._color;
    }

    /**
     * Установка цвета ячейки.
     * @param value
     */
    public set color(value: colorType) {
        this._color = value;
    }

    /**
     * Создает экземпляр ячейки.
     * @param state
     * @param color
     */
    constructor(state: boolean = false, color: colorType = "none") {
        this._state = state;
        this._color = color;
    }
}