/**
 * @fileoverview Основной файл игры
 * @author KorzikAlex
 * @description Это основной файл для игры Тетрис, который инициализирует игру, определяет фигуры и их цвета,
 * а также содержит функции для управления игрой.
 * @version 1.0.0
 */

/**
 * Определение интерфейсов для тетрамино, цветов и очков
 */
interface Tetrominoes {
    I: number[][];
    O: number[][];
    T: number[][];
    S: number[][];
    Z: number[][];
    J: number[][];
    L: number[][];
}

interface TetrominoColors {
    I: string;
    O: string;
    T: string;
    S: string;
    Z: string;
    J: string;
    L: string;
}

interface Scores {
    oneLine: number;
    twoLines: number;
    threeLines: number;
    fourLines: number;
    softDrop: number;
    hardDrop: number;
    tSpin: number;
    tSpinMini: number;
    backToBack: number;
    combo: number;
}

/**
 * Интерфейс для текущей фигуры
 */
interface Tetromino {
    name: string;
    matrix: number[][];
    row: number;
    col: number;
}


/**
 * Определение всех тетрамино в виде матриц
 */
const tetrominoes: Tetrominoes = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1],
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ]
}

/**
 * Цвета для каждой фигуры
 */
const tetrominoColors: TetrominoColors = {
    'I': "cyan",
    'O': "yellow",
    'T': "purple",
    'S': "green",
    'Z': "red",
    'J': "blue",
    'L': "orange"
};

/**
 * Очки за различные действия в игре
 */
const scores: Scores = {
    "oneLine": 100,
    "twoLines": 300,
    "threeLines": 500,
    "fourLines": 800,
    "softDrop": 1,
    "hardDrop": 2,
    "tSpin": 400,
    "tSpinMini": 100,
    "backToBack": 1.5, // Множитель для back-to-back
    "combo": 50, // Бонус за комбо
};

/**
 * Генерирует случайное целое число в диапазоне от min до max
 * @param min
 * @param max
 * @returns {number}
 */
function randInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Функция для рисования на canvas
 */
function draw(): void {
    const canvas = document.getElementById("field") as HTMLCanvasElement | null; // Получаем элемент canvas из HTML
    if (canvas && canvas.getContext) {
        let ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillRect(25, 25, 100, 100);
            ctx.clearRect(45, 45, 60, 60);
        }
    }
}

/**
 * Обработчик событий для нажатий клавиш
 */
document.addEventListener(
    "keydown",
    (event) => {
        switch (event.key) {
            case "ArrowLeft":
                // TODO: движение влево
                break;
            case "ArrowRight":
                // TODO: движение вправо
                break;
            case "ArrowDown":
                // TODO: ускоренное падение
                break;
            case "ArrowUp":
                // TODO: поворот
                break;
            case " ":
                // TODO: мгновенное падение
                break;
            case "Escape":
                // TODO: конец игры
                break;
            case "F1":
                // TODO: показать справку
                break;
            case "R":
                // TODO: перезапуск игры
                break;
        }
    }
)

function generateSequence() {
    const tetrominoNames: string[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] // Имена всех тетрамино
    while (tetrominoNames.length) {
        const rand = randInt(0, tetrominoNames.length - 1);
        const name = tetrominoNames.splice(rand, 1)[0]; // Удаляем выбранное имя из массива
        tetrominoSequence.push(name); // Добавляем имя в последовательность
    }
}

function getNextTetromino(): Tetromino  {
    if (tetrominoSequence.length === 0) generateSequence();
    const name: string = tetrominoSequence.pop()!;
    const matrix = tetrominoes[name];
    const col = (field[0].length >> 1) - Math.ceil(matrix[0].length >> 1);
    const row = name === 'I' ? -1 : -2;
    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}

function rotate(matrix: number[][]): number[][] {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
    // на входе матрица, и на выходе тоже отдаём матрицу
    return result;
}

// счётчик
let count: number = 0;

// текущая фигура в игре
let tetromino: Tetromino = getNextTetromino();
const cell: number = 50 // Размер одной клетки сетки
let tetrominoSequence: string[] = [] // Последовательность тетрамино
let field: number[][] = [] // Игровое поле
let gameOver = false; // Флаг окончания игры

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

let username: string | null = localStorage.getItem("tetris.username");

// Создаем игровое поле 10x20, заполненное нулями
for (let row = -2; row < ROWS; row++) {
    field[row] = []; // Инициализируем строку
    for (let col = 0; col < COLS; col++) {
        field[row]![col] = 0;// Заполняем ячейки нулями
    }
}

const audioPop = document.getElementById("pop")




