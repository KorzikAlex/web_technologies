/**
 * @file KeyboardHandler.ts
 * @fileOverview Обработчик клавиатуры для игры в Тетрис
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module KeyboardHandler
 */
import type {Game} from "./Game"; // Импортируем класс игры
import type {Figure} from "./Figure"; // Импортируем класс фигуры

/**
 * Класс для обработки событий клавиатуры
 */
export class KeyboardHandler {
    private game: Game;
    private keydownHandler: (event: KeyboardEvent) => void = this.handleKeydown.bind(this);

    /**
     * Конструктор класса KeyboardHandler
     * @param game
     */
    constructor(game: Game) {
        this.game = game;
    }

    /**
     * Обработчик события нажатия клавиши
     * @param event
     */
    handleKeydown(event: KeyboardEvent): void {
        const currentFigure: Figure | null = this.game.currentFigure; // Текущая фигура
        if (!currentFigure) return; // Если фигуры нет, выходим из функции
        switch (event.key) {
            case 'ArrowLeft':
                if (this.game.playfield.isValidPosition(currentFigure, -1, 0)) {
                    currentFigure.x--;
                    console.log(currentFigure.x, currentFigure.y, event.key);
                }
                break
            case 'ArrowRight':
                if (this.game.playfield.isValidPosition(currentFigure, 1, 0)) {
                    currentFigure.x++;
                    console.log(currentFigure.x, currentFigure.y, event.key);
                }
                break
            case 'ArrowDown':
                this.game.moveDown();
                break
            case 'ArrowUp':
                const figureBeforeRotation = currentFigure.clone();
                currentFigure.rotate();
                if (!this.game.playfield.isValidPosition(currentFigure)) {
                    currentFigure.restore(figureBeforeRotation);
                }
                break
            case ' ':
                event.preventDefault();
                this.game.hardDrop();
                break
        }
    }

    /**
     * Привязывает обработчик событий к документу
     */
    attach() {
        document.addEventListener("keydown", this.keydownHandler);
    }

    /**
     * Отвязывает обработчик событий от документа
     */
    detach() {
        document.removeEventListener("keydown", this.keydownHandler);
    }
}