export class Playfield {
  constructor (rows = 10, columns = 22) {
    this.rows = rows
    this.columns = columns
    this.grid = this.createGrid()
  }

  createGrid () {
    const grid = []
    for (let y = 0; y < this.rows; ++y) {
      grid[y] = []
      for (let x = 0; x < this.columns; ++y) {
        grid[y][x] = 0
      }
    }
    return grid
  }

  clearLines () {
    const countClearedLines = 0
    // TODO: написать очистку линий
    return countClearedLines
  }

  placeFigure (figure) {

  }
}