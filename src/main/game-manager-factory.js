const { TraditionalBackground } = require('../backgrounds')
const { Board, Snake, Target } = require('../components')
const GameManager = require('./game-manager')

class GameManagerFactory {
  static makeGameManager () {
    const board = new Board({ background: TraditionalBackground })
    const snake = new Snake()
    const target = new Target()

    return new GameManager({ board, snake, target })
  }
}

module.exports = GameManagerFactory
