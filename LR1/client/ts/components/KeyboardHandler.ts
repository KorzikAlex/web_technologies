import type {Game} from "./Game";
import type {Figure} from "./Figure";

export class KeyboardHandler {
    private game: Game;
    private keydownHandler: (event: KeyboardEvent) => void = this.handleKeydown.bind(this);

    constructor(game: Game) {
        this.game = game;
    }

    handleKeydown(event: KeyboardEvent): void {
        const piece: Figure | null = this.game.currentFigure;
        if (!piece) return;

        switch (event.key) {
            case 'ArrowLeft':
                // TODO: движение влево
                piece.y++;
                break
            case 'ArrowRight':
                // TODO: движение вправо
                break
            case 'ArrowDown':
                piece.y++;
                // TODO: ускоренное падение
                break
            case 'ArrowUp':
                // TODO: поворот
                piece.rotate()
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

    attach() {
        document.addEventListener("keydown", this.keydownHandler);
    }

    detach() {
        document.removeEventListener("keydown", this.keydownHandler);
    }
}