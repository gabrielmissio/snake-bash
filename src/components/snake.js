const { DirectionsEnum } = require('../utils/enums')

const OPPOSITE_DIRECTIONS = Object.freeze({
  [DirectionsEnum.RIGHT]: DirectionsEnum.LEFT,
  [DirectionsEnum.LEFT]: DirectionsEnum.RIGHT,
  [DirectionsEnum.DOWN]: DirectionsEnum.UP,
  [DirectionsEnum.UP]: DirectionsEnum.DOWN
})

/** Turns buffered between two frames, so quick corners are never swallowed. */
const MAX_QUEUED_DIRECTIONS = 2

class Snake {
  constructor ({ startingPosition, startingDirection } = {}) {
    this.row = (startingPosition && startingPosition.row) || 2
    this.column = (startingPosition && startingPosition.column) || 2
    this.currentDirection = startingDirection || DirectionsEnum.RIGHT

    this.setToInitialState()
  }

  setToInitialState () {
    this.properties = {
      currentDirection: this.currentDirection,
      queuedDirections: [],
      body: [{ row: this.row, column: this.column }]
    }
  }

  /**
   * Queues a turn instead of applying it right away. A direction is only
   * accepted when it is a legal turn from the direction that will precede it,
   * which is what stops a fast double tap from folding the snake onto itself.
   */
  changeDirection (newDirection) {
    if (!Object.values(DirectionsEnum).includes(newDirection)) return false

    const { queuedDirections } = this.properties
    if (queuedDirections.length >= MAX_QUEUED_DIRECTIONS) return false

    const previousDirection = queuedDirections.length > 0
      ? queuedDirections[queuedDirections.length - 1]
      : this.properties.currentDirection

    const isReversal = newDirection === OPPOSITE_DIRECTIONS[previousDirection]
    const isRepeat = newDirection === previousDirection
    if (isReversal || isRepeat) return false

    queuedDirections.push(newDirection)
    return true
  }

  /** Promotes one queued turn. Called once per frame, right before moving. */
  applyQueuedDirection () {
    const { queuedDirections } = this.properties
    if (queuedDirections.length === 0) return this.properties.currentDirection

    this.properties.currentDirection = queuedDirections.shift()
    return this.properties.currentDirection
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
      [DirectionsEnum.RIGHT]: { row: currentHeadPosition.row, column: currentHeadPosition.column + 1 },
      [DirectionsEnum.LEFT]: { row: currentHeadPosition.row, column: currentHeadPosition.column - 1 },
      [DirectionsEnum.DOWN]: { row: currentHeadPosition.row + 1, column: currentHeadPosition.column },
      [DirectionsEnum.UP]: { row: currentHeadPosition.row - 1, column: currentHeadPosition.column }
    }

    return options[currentDirection]
  }

  getHeadPosition () {
    return this.properties.body[0]
  }

  getTailPosition () {
    return this.properties.body[this.properties.body.length - 1]
  }
}

module.exports = Snake
