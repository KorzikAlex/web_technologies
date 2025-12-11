export class EventsManager {
    bind: { [key: string]: string }; // сопоставление клавиш действиям
    action: { [key: string]: boolean }; // действия

    constructor() {
        this.bind = {
            ArrowUp: 'up',
            w: 'up',
            W: 'up',
            ArrowLeft: 'left',
            a: 'left',
            A: 'left',
            ArrowDown: 'down',
            s: 'down',
            S: 'down',
            ArrowRight: 'right',
            d: 'right',
            D: 'right',
            ' ': 'bomb', // пробел
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
        // настройка событий «мыши»
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        // контроль событий клавиатуры
        document.body.addEventListener('keydown', this.onKeyDown.bind(this));
        document.body.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onMouseDown(event: MouseEvent): void {
        // нажатие на клавишу «мыши»
        this.action['bomb'] = true;
    }

    onMouseUp(event: MouseEvent): void {
        // отпустили клавишу «мыши»
        this.action['bomb'] = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        // нажали на кнопку на клавиатуре, проверили, есть ли сопоставление действию
        // для события с кодом key
        const action = this.bind[event.key];
        if (action) {
            // проверка на action === true
            this.action[action] = true; // согласились выполнять действие
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        // отпустили кнопку на клавиатуре
        // проверили, есть ли сопоставление действию для события
        // с кодом key
        const action = this.bind[event.key]; // проверили наличие действия
        if (action) {
            // проверка на action === true
            this.action[action] = false; // отменили действие
        }
    }
}
