import type {Playfield} from "./Playfield";
import {Renderer} from "./Renderer";
import type {Figure} from "./Figure";
import {TETRIS_BLOCK_SIZE} from "../utils/consts";
import type {Cell} from "./Cell";

/**
 * Класс PlayfieldRenderer отвечает за отрисовку игрового поля тетриса.
 * @class PlayfieldRenderer
 * @extends Renderer<Figure>
 */
export class PlayfieldRenderer extends Renderer<Figure> {
    /**
     * Игровое поле для отрисовки.
     * @private
     */
    private playfield: Playfield;
    /**
     * Смещение по оси X для центрирования поля на канвасе.
     * @private
     */
    private offsetX: number = 0;
    /**
     * Смещение по оси Y для центрирования поля на канвасе.
     * @private
     */
    private offsetY: number = 0;

    /**
     * Создает экземпляр PlayfieldRenderer.
     * @param canvas - HTMLCanvasElement для отрисовки.
     * @param playfield - игровое поле для отрисовки.
     * @param cellSize - размер ячейки в пикселях (по умолчанию TETRIS_BLOCK_SIZE).
     */
    constructor(canvas: HTMLCanvasElement, playfield: Playfield, cellSize: number = TETRIS_BLOCK_SIZE) {
        super(canvas, cellSize);
        this.playfield = playfield;
        this.offsetX = (canvas.width - playfield.cols * cellSize) / 2;
        this.offsetY = (canvas.height - playfield.rows * cellSize) / 2;
    }

    /**
     * Отрисовывает сетку игрового поля.
     * @private
     */
    private renderGrid(): void {
        this.ctx.fillStyle = "transparent";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y: number = 0; y < this.playfield.rows; y++) {
            for (let x: number = 0; x < this.playfield.cols; x++) {
                this.drawCell(
                    this.offsetX + x * this.cellSize,
                    this.offsetY + y * this.cellSize,
                    this.cellSize,
                    "transparent",
                    "lightgray"
                );
            }
        }
    }

    /**
     * Отрисовывает уже размещенные фигуры на игровом поле.
     * @private
     */
    private renderExistingFigures(): void {
        for (let y: number = 0; y < this.playfield.rows; y++) {
            for (let x: number = 0; x < this.playfield.cols; x++) {
                const cell: Cell = this.playfield.grid[y]![x]!;
                if (cell.state) {
                    this.drawCell(
                        this.offsetX + x * this.cellSize,
                        this.offsetY + y * this.cellSize,
                        this.cellSize,
                        cell.color,
                        "black");
                }
            }
        }
    }

    /**
     * Отрисовывает текущую фигуру на игровом поле.
     * @param currentFigure - текущая фигура для отрисовки.
     * @private
     */
    private renderCurrentFigure(currentFigure: Figure): void {
        for (let y: number = 0; y < currentFigure.rows; ++y) {
            for (let x: number = 0; x < currentFigure.cols; ++x) {
                if (currentFigure.shape[y]![x]) {
                    this.drawCell(
                        this.offsetX + (currentFigure.x + x) * this.cellSize,
                        this.offsetY + (currentFigure.y + y) * this.cellSize,
                        this.cellSize,
                        currentFigure.color,
                        "black");
                }
            }
        }
    }

    /**
     * Отрисовывает все элементы игрового поля: сетку, уже размещенные фигуры и текущую фигуру.
     * @param currentFigure
     */
    render(currentFigure: Figure): void {
        this.renderGrid()
        this.renderExistingFigures()
        this.renderCurrentFigure(currentFigure)
    }
}

