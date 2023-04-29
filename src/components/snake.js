const { DirectionsEnum } = require('../utils/enums')

class Snake {
  constructor ({ startingPosition, startingDirection } = {}) {
    this.row = (startingPosition && startingPosition.row) || 2
    this.column = (startingPosition && startingPosition.column) || 2
    this.currentDirection = startingDirection || DirectionsEnum.RIGTH

    this.setToInitialState()
  }

  setToInitialState () {
    this.properties = {
      currentDirection: this.currentDirection,
      body: [{ row: this.row, column: this.column }]
    }
  }

  changeDirection (newDirection) {
    const { currentDirection } = this.properties
    const oppositeDirections = {
      [DirectionsEnum.RIGTH]: DirectionsEnum.LEFT,
      [DirectionsEnum.LEFT]: DirectionsEnum.RIGTH,
      [DirectionsEnum.DOWN]: DirectionsEnum.UP,
      [DirectionsEnum.UP]: DirectionsEnum.DOWN
    }

    if (newDirection !== oppositeDirections[currentDirection]) {
      this.properties.currentDirection = newDirection
    }
  }

  move ({
    isScore, scoreHandler, isGameOver, gameOverHandler
  } = {}) {
    const { body } = this.properties
    body.unshift(this.getNextPosition())

    if (isGameOver()) return gameOverHandler()
    if (isScore()) return scoreHandler()
    return body.pop()
  }

  getNextPosition () {
    const { currentDirection } = this.properties

    const allowedValues = Object.values(DirectionsEnum)
    const isValidDirection = allowedValues.includes(currentDirection)
    if (!isValidDirection) throw new Error('INVALID DIRECTION')

    const currentHeadPosition = this.getHeadPosition()
    const options = {
      [DirectionsEnum.RIGTH]: { row: currentHeadPosition.row, column: currentHeadPosition.column + 1 },
      [DirectionsEnum.LEFT]: { row: currentHeadPosition.row, column: currentHeadPosition.column - 1 },
      [DirectionsEnum.DOWN]: { row: currentHeadPosition.row + 1, column: currentHeadPosition.column },
      [DirectionsEnum.UP]: { row: currentHeadPosition.row - 1, column: currentHeadPosition.column }
    }

    return options[currentDirection]
  }

  getHeadPosition () {
    return this.properties.body[0]
  }
}

module.exports = Snake
