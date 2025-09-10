/**
 * @fileoverview Основной файл игры
 * @author KorzikAlex
 * @description Это основной файл для игры Тетрис, который инициализирует игру, определяет фигуры и их цвета,
 * а также содержит функции для управления игрой.
 * @version 1.0.0
 */

/**
 * Определение всех тетрамино и их форм
 * @type {{I: number[][], O: number[][], T: number[][], S: number[][], Z: number[][], J: number[][], L: number[][]}}
 */
const tetrominoes = {
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
 * @type {{I: string, O: string, T: string, S: string, Z: string, J: string, L: string}}
 */
const tetrominoColors = {
    'I': "cyan",
    'O': "yellow",
    'T': "purple",
    'S': "green",
    'Z': "red",
    'J': "blue",
    'L': "orange"
}

const tetrominoNames = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] // Имена всех тетрамино

/**
 * Основная функция для инициализации игры
 */
function main() {
    const cell = 50 // Размер одной клетки сетки
    let tetrominoSequence = [] // Последовательность тетрамино
    let field = [] // Игровое поле

    let username = localStorage["tetris.username"]
// Создаем игровое поле 10x20, заполненное нулями
    for (let row = -2; row < 20; row++) {
        field[row] = []; // Инициализируем строку
        for (let col = 0; col < 10; col++) field[row][col] = 0; // Заполняем ячейки нулями
    }
}


/**
 * Генерирует случайное целое число в диапазоне от min до max
 * @param min
 * @param max
 * @returns {*}
 */
function randInt(min, max) {
    return Math.random() * (max - min) + min;
    // TODO: протестировать функцию
}

/**
 * Генерирует следующую фигуру
 */
function nextTetromino() {
    const num = randInt(0, 6); // случайное число от 0 до 6
    const currentTetromino = tetrominoNames[num]; // имя текущей фигуры
    return {name: currentTetromino, matrix: tetrominoes[currentTetromino]} // возвращаем объект с именем и матрицей фигуры
    // TODO: продолжить реализацию функции
}

/**
 * Функция для рисования на canvas
 */
function draw() {
    const canvas = document.getElementById("field") // Получаем элемент canvas из HTML
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        ctx.fillRect(25, 25, 100, 100);
        ctx.clearRect(45, 45, 60, 60);
    }
}

/**
 * Обработчик событий для нажатий клавиш
 */
document.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "ArrowLeft" || event.key === "a") {
            console.log(event.key);
            // Движение влево
        } else if (event.key === "ArrowRight" || event.key === "d") {
            console.log(event.key);
            // Движение вправо
        } else if (event.key === "ArrowDown" || event.key === "s") {
            console.log(event.key);
            // Быстрое падение
        } else if (event.key === "ArrowUp" || event.key === "w") {
            console.log(event.key);
            // Поворот фигуры
        } else if (event.key === " ") {
            console.log(event.key);
            // Пауза
        } else if (event.key === "Enter") {
            console.log(event.key);
            // Начать игру
        } else if (event.key === "Escape") {
            console.log(event.key);
            // Выйти из игры
        } else if (event.key === "F1") {
            console.log(event.key);
            // Показать справку
        } else if (event.key === "Shift") {
            console.log(event.key);
            // Ускорить падение
        } else if (event.key === "Control") {
            console.log(event.key);
            // Замедлить падение
        } else {
            console.log(`Необработанное нажатие клавиши: ${event.key}`);
        }
    })

main() // Запускаем основную функцию для инициализации игры
