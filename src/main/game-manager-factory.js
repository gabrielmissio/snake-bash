const { TraditionalBackground } = require('../backgrounds')
const { Board, Snake, Target } = require('../components')
const GameManager = require('./game-manager')

class GameManagerFactory {
  static makeGameManager ({ rows = 15, columns = 15 } = {}) {
    const board = new Board({
      background: TraditionalBackground,
      boardSize: { row: rows, column: columns }
    })
    const snake = new Snake()
    const target = new Target()

    board.updateSnake({ snake })

    const gameManager = new GameManager({ board, snake, target })
    gameManager.spawnTarget()

    return gameManager
  }
}

module.exports = GameManagerFactory
