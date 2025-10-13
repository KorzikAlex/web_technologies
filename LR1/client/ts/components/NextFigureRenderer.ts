/**
 * @file NextFigureRenderer.ts
 * @fileOverview Этот файл содержит определение класса NextFigureRenderer, который отвечает за отрисовку следующей фигуры тетриса.
 * @author Korzik
 * @license MIT
 * @copyright 2025
 * @module NextFigureRenderer
 */
import {Renderer} from "./Renderer";
import type {Figure} from "./Figure";
import type {tetrominoMatrix} from "../types";

/**
 * Класс NextFigureRenderer отвечает за отрисовку следующей фигуры тетриса.
 * @class NextFigureRenderer
 * @extends Renderer<Figure>
 */
export class NextFigureRenderer extends Renderer<Figure> {
    /**
     * Отрисовывает следующую фигуру на канвасе.
     * @param nextFigure
     */
    render(nextFigure: Figure): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const shape: tetrominoMatrix = nextFigure.shape; // Форма следующей фигуры
        const offsetX: number = Math.floor((this.canvas.width - shape[0]!.length * this.cellSize) / 2); // Центрирование по X
        const offsetY: number = Math.floor((this.canvas.height - shape.length * this.cellSize) / 2); // Центрирование по Y

        for (let y: number = 0; y < shape.length; y++) {
            for (let x: number = 0; x < shape[y]!.length; x++) {
                if (shape[y]![x]) {
                    this.drawCell(
                        offsetX + x * this.cellSize,
                        offsetY + y * this.cellSize,
                        this.cellSize,
                        nextFigure.color,
                        "black")
                }
            }
        }
    }

    /**
     * Создает экземпляр NextFigureRenderer.
     * @param canvas - HTMLCanvasElement для отрисовки.
     * @param cellSize - размер ячейки в пикселях.
     */
    constructor(canvas: HTMLCanvasElement, cellSize: number) {
        super(canvas, cellSize);
    }
}