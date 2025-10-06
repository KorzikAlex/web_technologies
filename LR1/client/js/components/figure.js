import { TETROMINO_COLORS, TETROMINOES } from '../settings'

export class Figure {
  constructor (type, color) {
    this.shape = TETROMINOES[type]
    this.color = TETROMINO_COLORS[color]
    // TODO: ПОМЕНЯТЬ X
    this.x = 0
    this.y = 0
  }

  random () {
    // TODO: Написать функцию рандомной фигуры
  }

  rotate () {
    // TODO: Написать функцию поворота
  }
}