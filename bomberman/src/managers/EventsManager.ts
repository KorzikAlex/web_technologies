/**
 * Менеджер событий для обработки ввода с клавиатуры и геймпада
 */
export class EventsManager {
    /**
     * Сопоставление клавиш клавиатуры с действиями
     */
    bind: Record<string, string>;
    /**
     * Текущее состояние действий
     */
    action: Record<string, boolean>;
    /**
     * Текущее состояние действий от клавиатуры
     */
    keyboardAction: Record<string, boolean>;
    /**
     * Индекс подключенного геймпада
     */
    gamepadIndex: number | null;
    /**
     * Мертвая зона для стиков геймпада
     */
    deadzone: number; // мертвая зона для стиков

    /**
     * Конструктор EventsManager
     * @constructor
     */
    constructor() {
        this.bind = {
            ArrowUp: 'up',
            w: 'up',
            W: 'up',
            ц: 'up',
            Ц: 'up',
            ArrowLeft: 'left',
            a: 'left',
            A: 'left',
            ф: 'left',
            Ф: 'left',
            ArrowDown: 'down',
            s: 'down',
            S: 'down',
            ы: 'down',
            Ы: 'down',
            ArrowRight: 'right',
            d: 'right',
            D: 'right',
            в: 'right',
            В: 'right',
            ' ': 'bomb',
            p: 'pause',
            P: 'pause',
            з: 'pause',
            З: 'pause',
            r: 'restart',
            R: 'restart',
            к: 'restart',
            К: 'restart',
        };

        this.action = {
            up: false,
            left: false,
            down: false,
            right: false,
            fire: false,
            bomb: false,
            pause: false,
            restart: false,
        };

        this.keyboardAction = {
            up: false,
            left: false,
            down: false,
            right: false,
            fire: false,
            bomb: false,
            pause: false,
            restart: false,
        };

        this.gamepadIndex = null;
        this.deadzone = 0.3; // мертвая зона 30% для стиков
    }

    /**
     * Настройка менеджера событий для заданного canvas
     * @param canvas
     */
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
    /**
     * Обработка подключения геймпада
     * @param event Событие подключения геймпада
     */
    onGamepadConnected(event: GamepadEvent): void {
        console.log('Gamepad connected:', event.gamepad.id);
        this.gamepadIndex = event.gamepad.index;
    }

    /**
     * Обработка отключения геймпада
     * @param event Событие отключения геймпада
     */
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

    /**
     * Опрос состояния геймпада и обновление действий
     */
    pollGamepad(): void {
        // Инициализируем состояния геймпада
        let gamepadLeft: boolean = false;
        let gamepadRight: boolean = false;
        let gamepadUp: boolean = false;
        let gamepadDown: boolean = false;
        let gamepadBomb: boolean = false;
        let gamepadPause: boolean = false;
        let gamepadRestart: boolean = false;

        if (this.gamepadIndex !== null) {
            const gamepads: (Gamepad | null)[] = navigator.getGamepads();
            const gamepad: Gamepad | null = gamepads[this.gamepadIndex];

            if (gamepad) {
                // Обработка левого стика (оси 0 и 1)
                const leftStickX: number = gamepad.axes[0]; // горизонтальная ось
                const leftStickY: number = gamepad.axes[1]; // вертикальная ось

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

                // Кнопка Start (button 9) - пауза
                if (gamepad.buttons[9]?.pressed) {
                    gamepadPause = true;
                }

                // Кнопка Select/Back (button 8) - перезагрузка
                if (gamepad.buttons[8]?.pressed) {
                    gamepadRestart = true;
                }
            }
        }

        // Объединяем состояния клавиатуры и геймпада (OR)
        this.action.left = this.keyboardAction.left || gamepadLeft;
        this.action.right = this.keyboardAction.right || gamepadRight;
        this.action.up = this.keyboardAction.up || gamepadUp;
        this.action.down = this.keyboardAction.down || gamepadDown;
        this.action.bomb = this.keyboardAction.bomb || gamepadBomb;
        this.action.pause = this.keyboardAction.pause || gamepadPause;
        this.action.restart = this.keyboardAction.restart || gamepadRestart;

        // Продолжаем опрос
        requestAnimationFrame((): void => this.pollGamepad());
    }
    /**
     * Обработка нажатия клавиши
     * @param event Событие нажатия клавиши
     */
    onKeyDown(event: KeyboardEvent): void {
        const action: string | undefined = this.bind[event.key];
        if (action) {
            this.keyboardAction[action] = true; // согласились выполнять действие
            event.preventDefault(); // Предотвращаем скроллинг страницы
        }
    }

    /**
     * Обработка отпускания клавиши
     * @param event Событие отпускания клавиши
     */
    onKeyUp(event: KeyboardEvent): void {
        const action = this.bind[event.key]; // проверили наличие действия
        if (action) {
            this.keyboardAction[action] = false; // отменили действие
        }
    }
}
