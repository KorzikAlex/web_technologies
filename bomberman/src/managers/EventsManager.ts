export class EventsManager {
    bind: { [key: string]: string }; // сопоставление клавиш действиям
    action: { [key: string]: boolean }; // действия
    keyboardAction: { [key: string]: boolean }; // действия от клавиатуры
    gamepadIndex: number | null; // индекс подключенного геймпада
    deadzone: number; // мертвая зона для стиков

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
            bomb: false,
        };

        this.keyboardAction = {
            up: false,
            left: false,
            down: false,
            right: false,
            fire: false,
            bomb: false,
        };

        this.gamepadIndex = null;
        this.deadzone = 0.3; // мертвая зона 30% для стиков
    }

    setup(canvas: HTMLCanvasElement): void {
        // Делаем canvas фокусируемым
        canvas.setAttribute('tabindex', '0');
        canvas.focus();

        // Контроль событий клавиатуры на window для надежности
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));

        // Обработка подключения/отключения геймпада
        window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
        window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));

        // Запускаем опрос состояния геймпада
        this.pollGamepad();
    }

    onGamepadConnected(event: GamepadEvent): void {
        console.log('Gamepad connected:', event.gamepad.id);
        this.gamepadIndex = event.gamepad.index;
    }

    onGamepadDisconnected(event: GamepadEvent): void {
        console.log('Gamepad disconnected:', event.gamepad.id);
        if (this.gamepadIndex === event.gamepad.index) {
            this.gamepadIndex = null;
            // Сбрасываем все действия при отключении геймпада
            this.action.up = false;
            this.action.down = false;
            this.action.left = false;
            this.action.right = false;
        }
    }

    pollGamepad(): void {
        // Инициализируем состояния геймпада
        let gamepadLeft = false;
        let gamepadRight = false;
        let gamepadUp = false;
        let gamepadDown = false;
        let gamepadBomb = false;

        if (this.gamepadIndex !== null) {
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[this.gamepadIndex];

            if (gamepad) {
                // Обработка левого стика (оси 0 и 1)
                const leftStickX = gamepad.axes[0]; // горизонтальная ось
                const leftStickY = gamepad.axes[1]; // вертикальная ось

                // Горизонтальное движение (стик)
                if (leftStickX < -this.deadzone) {
                    gamepadLeft = true;
                } else if (leftStickX > this.deadzone) {
                    gamepadRight = true;
                }

                // Вертикальное движение (стик)
                if (leftStickY < -this.deadzone) {
                    gamepadUp = true;
                } else if (leftStickY > this.deadzone) {
                    gamepadDown = true;
                }

                // D-pad (кнопки 12, 13, 14, 15 на стандартном геймпаде)
                if (gamepad.buttons[12]?.pressed) {
                    gamepadUp = true;
                }
                if (gamepad.buttons[13]?.pressed) {
                    gamepadDown = true;
                }
                if (gamepad.buttons[14]?.pressed) {
                    gamepadLeft = true;
                }
                if (gamepad.buttons[15]?.pressed) {
                    gamepadRight = true;
                }

                // Кнопки действий (A/B или 0/1)
                if (gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed) {
                    gamepadBomb = true;
                }
            }
        }

        // Объединяем состояния клавиатуры и геймпада (OR)
        this.action.left = this.keyboardAction.left || gamepadLeft;
        this.action.right = this.keyboardAction.right || gamepadRight;
        this.action.up = this.keyboardAction.up || gamepadUp;
        this.action.down = this.keyboardAction.down || gamepadDown;
        this.action.bomb = this.keyboardAction.bomb || gamepadBomb;

        // Продолжаем опрос
        requestAnimationFrame(() => this.pollGamepad());
    }

    onKeyDown(event: KeyboardEvent): void {
        const action = this.bind[event.key];
        if (action) {
            this.keyboardAction[action] = true; // согласились выполнять действие
            event.preventDefault(); // Предотвращаем скроллинг страницы
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        const action = this.bind[event.key]; // проверили наличие действия
        if (action) {
            this.keyboardAction[action] = false; // отменили действие
        }
    }
}
