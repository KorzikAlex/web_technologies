import {Playfield} from "./Playfield";

export class Game {
    private isGameOver: boolean = false;
    private playfield: Playfield;
    private level: number = 1;
    private score: number = 0;
    private nextFigure: null = null;
    private currentFigure: null = null;
    private canvasPlayfield: HTMLCanvasElement;
    private canvasNextFigure: HTMLCanvasElement;
    private spanScoreValue: HTMLSpanElement;
    private spanLevelValue: HTMLSpanElement;

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
    }

    gameOver(): void {
        this.isGameOver = true;
        // TODO: реализовать окончание игры
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
