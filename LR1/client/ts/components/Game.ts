import {Playfield} from "./Playfield";
import {KeyboardHandler} from "./KeyboardHandler";
import {Figure} from "./Figure";
import {RecordStorageManager} from "./RecordStorageManager";
import {PlayfieldRenderer} from "./PlayfieldRenderer";

export class Game {
    private _isGameOver: boolean = false;
    public get isGameOver(): boolean {
        return this._isGameOver;
    }

    private playfield: Playfield;

    private _level: number = 1;
    public get level(): number {
        return this._level;
    }

    private _score: number = 0;
    public get score(): number {
        return this._score;
    }

    private _nextFigure: Figure | null = null;
    public get nextFigure(): Figure | null {
        return this._nextFigure;
    }
    private _currentFigure: Figure | null = null;
    public get currentFigure(): Figure | null {
        return this._currentFigure;
    }

    private canvasPlayfield: HTMLCanvasElement;
    private canvasNextFigure: HTMLCanvasElement;
    private spanScoreValue: HTMLSpanElement;
    private spanLevelValue: HTMLSpanElement;

    private keyboardHandler: KeyboardHandler = new KeyboardHandler(this);
    private recordStorageManager: RecordStorageManager = new RecordStorageManager();
    private renderer: PlayfieldRenderer;

    constructor(
        canvasPlayfield: HTMLCanvasElement,
        canvasNextFigure: HTMLCanvasElement,
        spanScoreValue: HTMLSpanElement,
        spanLevelValue: HTMLSpanElement,
        rows = 20,
        cols = 10
    ) {
        this.canvasPlayfield = canvasPlayfield;
        this.canvasNextFigure = canvasNextFigure;

        this.spanScoreValue = spanScoreValue;
        this.spanLevelValue = spanLevelValue;

        this.playfield = new Playfield(rows, cols);

        this.renderer = new PlayfieldRenderer(canvasPlayfield, this.playfield, 32);
    }

    gameOver(): void {
        this._isGameOver = true;
        // TODO: реализовать окончание игры
    }

    startGame(): void {
        this._isGameOver = false;
        this._nextFigure = Figure.random();
        this.renderer
        // TODO: реализовать старт игры
    }

    restartGame(): void {
        this._isGameOver = false;
        // TODO: реализовать перезапуск игры
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            // TODO: движение влево
            break
        case 'ArrowRight':
            // TODO: движение вправо
            break
        case 'ArrowDown':
            // TODO: ускоренное падение
            break
        case 'ArrowUp':
            // TODO: поворот
            break
        case ' ':
            // TODO: мгновенное падение
            break
        case 'Escape':
            // TODO: конец игры
            break
        case 'F1':
            // TODO: показать справку
            break
        case 'R':
            // TODO: перезапуск игры
            break
    }
})
