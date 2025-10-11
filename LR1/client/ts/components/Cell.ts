import type {colorType} from "../types";

export class Cell {
    private _state: boolean = false;
    public get state(): boolean {
        return this._state;
    }

    public set state(value: boolean) {
        this._state = value;
    }

    private _color: colorType;
    public get color(): colorType {
        return this._color;
    }

    public set color(value: colorType) {
        this._color = value;
    }

    constructor(state: boolean = false, color: colorType = "none") {

        this._state = state;
        this._color = color;
    }
}