/**
 * @file Game.ts
 * @fileOverview Основной класс игры
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module Game
 */
import {Playfield} from "./Playfield"; // Игровое поле
import {KeyboardHandler} from "./KeyboardHandler"; // Обработчик клавиатуры
import {Figure} from "./Figure"; // Фигура
import {RecordStorageManager} from "./RecordStorageManager"; // Менеджер хранения рекордов
import {PlayfieldRenderer} from "./PlayfieldRenderer"; // Рендерер игрового поля
import {TETRIS_BLOCK_SIZE, TETRIS_COLS, TETRIS_ROWS, USERNAME_KEY} from "../utils/utils"; // Константы
import {NextFigureRenderer} from "./NextFigureRenderer"; // Рендерер следующей фигуры
import {Ui} from "./Ui"; // UI
import {LEVELS} from "../types"; // Уровни

/**
 * Класс Game - основной класс игры
 * @class Game
 */
export class Game {
    /**
     * Флаг окончания игры
     * @private
     */
    private _isGameOver: boolean = false;
    /**
     * Получение флага окончания игры
     * @returns {boolean}
     */
    public get isGameOver(): boolean {
        return this._isGameOver;
    }

    /**
     * Игровое поле
     * @private
     */
    private playfield: Playfield;
    /**
     * Время последнего обновления
     * @private
     */
    private lastTime: number = 0;
    /**
     * Текущий уровень игры
     * @private
     */
    private _level: number = 1;
    /**
     * Получение текущего уровня игры
     * @returns {number}
     */
    public get level(): number {
        return this._level;
    }

    /**
     * Текущий счет игры
     * @private
     */
    private _score: number = 0;
    /**
     * Получение текущего счета игры
     * @returns {number}
     */
    public get score(): number {
        return this._score;
    }

    /**
     * Следующая фигура
     * @private
     */
    private _nextFigure: Figure | null = null;
    /**
     * Получение следующей фигуры
     * @returns {Figure | null}
     */
    public get nextFigure(): Figure | null {
        return this._nextFigure;
    }

    /**
     * Текущая фигура
     * @private
     */
    private _currentFigure: Figure | null = null;
    /**
     * Получение текущей фигуры
     * @returns {Figure | null}
     */
    public get currentFigure(): Figure | null {
        return this._currentFigure;
    }

    /**
     * Счетчик времени падения фигур
     * @private
     */
    private dropCounter: number = 0;
    /**
     * Интервал падения фигур в миллисекундах
     * @private
     */
    private dropInterval: number = LEVELS[this._level as keyof typeof LEVELS];
    /**
     * Игровое поле в виде canvas элемента
     * @private
     */
    private canvasPlayfield: HTMLCanvasElement;
    /**
     * Следующая фигура в виде canvas элемента
     * @private
     */
    private canvasNextFigure: HTMLCanvasElement;
    /**
     * Элемент для отображения счета
     * @private
     */
    private spanScoreValue: HTMLSpanElement;
    /**
     * Элемент для отображения уровня
     * @private
     */
    private spanLevelValue: HTMLSpanElement;
    /**
     * Обработчик клавиатуры
     * @private
     */
    private keyboardHandler: KeyboardHandler = new KeyboardHandler(this);
    /**
     * Менеджер хранения рекордов
     * @private
     */
    private recordStorageManager: RecordStorageManager = new RecordStorageManager();
    /**
     * Рендер игрового поля
     * @private
     */
    private playfieldRenderer: PlayfieldRenderer;
    /**
     * Рендер следующей фигуры
     * @private
     */
    private nextFigureRenderer: NextFigureRenderer;
    /**
     * UI
     * @private
     */
    private ui: Ui = new Ui();
    /**
     * Никнейм игрока
     * @private
     */
    private _nickname: string = this.recordStorageManager.read(USERNAME_KEY);
    /**
     * Получение никнейма игрока
     * @returns {string}
     */
    public get nickname(): string {
        return this._nickname;
    }

    /**
     * Конструктор класса Game
     * @param canvasPlayfield - canvas элемент игрового поля
     * @param canvasNextFigure - canvas элемент следующей фигуры
     * @param spanScoreValue - span элемент для отображения счета
     * @param spanLevelValue - span элемент для отображения уровня
     * @param rows - количество строк игрового поля
     * @param cols - количество колонок игрового поля
     */
    constructor(
        canvasPlayfield: HTMLCanvasElement,
        canvasNextFigure: HTMLCanvasElement,
        spanScoreValue: HTMLSpanElement,
        spanLevelValue: HTMLSpanElement,
        rows = TETRIS_ROWS,
        cols = TETRIS_COLS
    ) {
        this.canvasPlayfield = canvasPlayfield;
        this.canvasNextFigure = canvasNextFigure;

        this.spanScoreValue = spanScoreValue;
        this.spanLevelValue = spanLevelValue;

        this.playfield = new Playfield(rows, cols);

        this.playfieldRenderer = new PlayfieldRenderer(canvasPlayfield, this.playfield, TETRIS_BLOCK_SIZE);
        this.nextFigureRenderer = new NextFigureRenderer(canvasNextFigure, TETRIS_BLOCK_SIZE);

        this.keyboardHandler.attach();
    }

    /**
     * Окончание игры
     */
    gameOver(): void {
        this.recordStorageManager.saveRecord(this.recordStorageManager.read(USERNAME_KEY), this._score);
        this.ui.showLeaderboard(this.recordStorageManager, this._nickname, this._score);
        this.keyboardHandler.detach()
        this._isGameOver = true;
        // TODO: реализовать окончание игры
    }

    /**
     * Запуск игры
     */
    start(): void {
        this._isGameOver = false;
        this._nextFigure = Figure.random();
        this.nextFigureRenderer.render(this._nextFigure)
        this.playfieldRenderer.render(this._nextFigure);
    }

    /**
     * Перезапуск игры
     */
    restart(): void {
        this._isGameOver = false;
        // TODO: реализовать перезапуск игры
    }

    /**
     * Игровой цикл
     * @param time
     */
    loop(time: number = 0): void {
        if (this._isGameOver) return;
        const deltaTime: number = time - this.lastTime;
        this.lastTime = time;
        this.update(deltaTime);
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Закрепление фигуры на игровом поле
     */
    lockFigure(): void {
        this.playfield.placeFigure(this._currentFigure!);
        const linesCleared = this.playfield.clearLines();
    }

    /**
     * Обновление состояния игры
     * @param deltaTime
     */
    update(deltaTime: number): void {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            if (!this.playfield.isValidPosition(this._currentFigure!, 0, 1)) {
                this._currentFigure!.y++;
            } else {
                return;
            }
            this.dropCounter = 0;
        }
    }
}