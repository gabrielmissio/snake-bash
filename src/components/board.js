const {
  CostumesEnum: { SNAKE, TARGET, EMPTY }
} = require('../utils/enums')

class Board {
  constructor ({ background, boardSize = { row: 15, column: 15 } }) {
    this.row = boardSize.row
    this.column = boardSize.column
    this.background = background

    this.setToInitialState()
  }

  setToInitialState () {
    const { row, column } = this
    this.properties = this.background.makeBackground({ row, column })
  }

  getAvailablePositions () {
    return this.properties.flatMap((row, rowIndex) => {
      return row.map((column, columnIndex) => column === EMPTY
        ? { row: rowIndex, column: columnIndex }
        : null
      ).filter(Boolean)
    })
  }

  updateTarget ({ target }) {
    const { row, column } = target.position
    this.properties[row][column] = TARGET
  }

  updateSnake ({ snake }) {
    this.clearSnakeFragments()

    for (const { row, column } of snake.properties.body) {
      this.properties[row][column] = SNAKE
    }
  }

  clearSnakeFragments () {
    for (const row of this.properties) {
      for (let j = 0; j < row.length; j++) {
        if (row[j] === SNAKE) row[j] = EMPTY
      }
    }
  }
}

module.exports = Board
