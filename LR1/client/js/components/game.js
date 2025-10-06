import { Playfield } from './playfield'

export class Game {
  constructor (canvasPlayfield, canvasNextFigure, spanScoreValue, spanLevelValue, rows = 20, cols = 10) {
    this.isGameOver = false // Флаг окончания игры

    this.canvasPlayfield = canvasPlayfield
    this.canvasNextFigure = canvasNextFigure

    this.spanScoreValue = spanScoreValue
    this.spanLevelValue = spanLevelValue

    this.level = 1
    this.score = 0

    this.nextFigure = null // Следующая фигура
    this.currentFigure = null // Текущая фигура

    this.playfield = new Playfield(rows, cols)
  }

  gameOver () {
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

function generateSequence () {
  const tetrominoNames = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] // Имена всех тетрамино
  while (tetrominoNames.length) {
    const rand = randInt(0, tetrominoNames.length - 1)
    const name = tetrominoNames.splice(rand, 1)[0] // Удаляем выбранное имя из массива
    tetrominoSequence.push(name) // Добавляем имя в последовательность
  }
}

function getNextTetromino () {
  if (tetrominoSequence.length === 0) {
    generateSequence()
  }

  const name = tetrominoSequence.pop()
  const matrix = TETROMINOES[name]
  const col = (field[0].length >> 1) - Math.ceil(matrix[0].length >> 1)
  const row = (name === 'I' ? -1 : -2)
  return {
    name: name,
    matrix: matrix,
    row: row,
    col: col
  }
}

function rotate (matrix) {
  const N = matrix.length - 1
  const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]))
  // на входе матрица, и на выходе тоже отдаём матрицу
  return result
}

const canvas = document.getElementById('field')
const context = canvas.getContext('2d')
const grid = 32

const field = []
for (let row = 0; row <= 20; row++) {
  field[row] = []
  for (let col = 0; col < 10; col++) {
    field[row][col] = 0
  }
}

// счётчик
let count = 0
// текущая фигура в игре
let tetromino = getNextTetromino()
// const cell = 50; // Размер одной клетки сетки
// let tetrominoSequence = []; // Последовательность тетрамино
// let field = []; // Игровое поле
// let gameOver = false; // Флаг окончания игры
// const COLS = 10;
// const ROWS = 20;
// const BLOCK_SIZE = 30;
// let username = localStorage.getItem("tetris.username");
// // Создаем игровое поле 10x20, заполненное нулями
// for (let row = -2; row < ROWS; row++) {
//     field[row] = []; // Инициализируем строку
//     for (let col = 0; col < COLS; col++) {
//         field[row][col] = 0; // Заполняем ячейки нулями
//     }
// }
// const audioPop = document.getElementById("pop");
// export {};
// //# sourceMappingURL=main.js.map