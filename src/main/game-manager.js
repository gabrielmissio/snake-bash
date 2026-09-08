const {
  CostumesEnum: { BRICK, TARGET },
  StatusEnum: { GAMEOVER, RUNNING, PAUSED, VICTORY }
} = require('../utils/enums')

class GameManager {
  constructor ({ board, snake, target } = {}) {
    this.properties = {
      board,
      snake,
      target,
      status: RUNNING,
      score: 0,
      bestScore: 0
    }
  }

  isScore () {
    const { snake, board } = this.properties

    return board.getCostumeAt(snake.getHeadPosition()) === TARGET
  }

  /**
   * Collision is resolved against the snake body rather than the painted board,
   * because the board still shows the tail cell the snake is about to vacate.
   * Reading the board there killed the player for a move that is actually legal.
   */
  isGameOver () {
    const { snake, board } = this.properties
    const head = snake.getHeadPosition()

    if (!board.isInside(head)) return true
    if (board.getCostumeAt(head) === BRICK) return true

    const { body } = snake.properties
    const willGrow = board.getCostumeAt(head) === TARGET
    const lastCheckedIndex = willGrow ? body.length : body.length - 1

    for (let i = 1; i < lastCheckedIndex; i++) {
      const isSameCell = body[i].row === head.row && body[i].column === head.column
      if (isSameCell) return true
    }

    return false
  }

  gameOverHandler () {
    const { snake } = this.properties

    // Drop the head that caused the collision. It sits on a wall or on the
    // body, and painting it there would punch a hole in the border.
    if (snake.properties.body.length > 1) snake.properties.body.shift()

    this.properties.status = GAMEOVER
  }

  scoreHandler () {
    const { board, snake } = this.properties

    // Paint the grown snake first so the next target cannot land underneath it.
    board.updateSnake({ snake })

    this.properties.score += 1
    this.properties.bestScore = Math.max(this.properties.bestScore, this.properties.score)

    if (!this.spawnTarget()) this.properties.status = VICTORY
  }

  /** Returns false when the board is full, which is the win condition. */
  spawnTarget () {
    const { board, target } = this.properties
    const availablePositions = board.getAvailablePositions()
    if (availablePositions.length === 0) return false

    target.getNextPosition({ availablePositions })
    board.updateTarget({ target })

    return true
  }

  togglePause () {
    const { status } = this.properties
    if (status === RUNNING) this.properties.status = PAUSED
    else if (status === PAUSED) this.properties.status = RUNNING
  }

  isPlayable () {
    return this.properties.status === RUNNING || this.properties.status === PAUSED
  }

  reset () {
    const { board, snake } = this.properties

    board.setToInitialState()
    snake.setToInitialState()
    board.updateSnake({ snake })
    this.spawnTarget()

    this.properties.status = RUNNING
    this.properties.score = 0
  }
}

module.exports = GameManager
