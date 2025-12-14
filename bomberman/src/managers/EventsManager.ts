export class EventsManager {
    bind: { [key: string]: string }; // сопоставление клавиш действиям
    action: { [key: string]: boolean }; // действия

    constructor() {
        this.bind = {
            ArrowUp: 'up',
            w: 'up',
            ArrowLeft: 'left',
            a: 'left',
            ArrowDown: 'down',
            s: 'down',
            ArrowRight: 'right',
            d: 'right',
            ' ': 'bomb',
        };

        this.action = {
            up: false,
            left: false,
            down: false,
            right: false,
            fire: false,
        };
    }

    setup(canvas: HTMLCanvasElement): void {
        // контроль событий клавиатуры
        canvas.addEventListener('keydown', this.onKeyDown.bind(this));
        canvas.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event: KeyboardEvent): void {
        const action = this.bind[event.key];
        if (action) {
            this.action[action] = true; // согласились выполнять действие
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        const action = this.bind[event.key]; // проверили наличие действия
        if (action) {
            this.action[action] = false; // отменили действие
        }
    }
}
