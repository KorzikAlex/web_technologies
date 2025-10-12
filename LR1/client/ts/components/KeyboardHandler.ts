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
                // TODO: движение влево
                currentFigure.y++;
                break
            case 'ArrowRight':
                // TODO: движение вправо
                break
            case 'ArrowDown':
                currentFigure.y++;
                // TODO: ускоренное падение
                break
            case 'ArrowUp':
                // TODO: поворот
                currentFigure.rotate()
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