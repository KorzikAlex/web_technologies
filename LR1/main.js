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
const colors = {
    'I': "cyan",
    'O': "yellow",
    'T': "purple",
    'S': "green",
    'Z': "red",
    'J': "blue",
    'L': "orange"
}

const tetrominoNames = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] // Имена всех тетрамино

const canvas = document.getElementById("game") // Получаем элемент canvas из HTML
const context = canvas.getContext("2d") // Получаем 2D контекст для рисования на canvas

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

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        // Движение влево
    } else if (event.key === "ArrowRight") {
        // Движение вправо
    } else if (event.key === "ArrowDown") {
        // Быстрое падение
    } else if (event.key === "ArrowUp") {
        // Поворот фигуры
    }
})

main() // Запускаем основную функцию для инициализации игры
