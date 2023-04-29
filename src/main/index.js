const Outputs = require('../outputs')
const { KeyboardInput } = require('../inputs')
const { DirectionsEnum } = require('../utils/enums')
const { GAMEOVER } = require('../utils/enums/status-enum')
const { makeGameManager } = require('./game-manager-factory')

const outputMode = process.env.OUTPUT_MODE || 'MainOutput'
const output = Outputs[outputMode]

const gameManager = makeGameManager()
const { board, snake, target } = gameManager.properties

board.updateSnake({ snake })
board.updateTarget({ target })

const gameOver = () => output.drawGameOver()
const nextFrame = () => {
  output.clear()
  output.drawInstructions({ quitKey: 'q', restartKey: 'r' })
  output.drawScore({ score: gameManager.properties.score })

  snake.move({
    isScore: () => gameManager.isScore(),
    isGameOver: () => gameManager.isGameOver(),
    gameOverHandler: () => gameManager.gameOverHandler(),
    scoreHandler: () => gameManager.scoreHandler()
  })

  board.updateSnake({ snake })
  output.drawBoard({ board: board.properties })
}

const intervalBetweenFramesInMilliseconds = 120
const run = () => {
  setTimeout(() => {
    nextFrame()
    const isGameOver = gameManager.properties.status === GAMEOVER
    return isGameOver ? gameOver() : run()
  }, intervalBetweenFramesInMilliseconds)
}

const quitGame = (key) => key === 'q'

const updateSnakeDirection = (key) => {
  if (key === 'r') {
    if (gameManager.properties.status === GAMEOVER) run()
    gameManager.reset()
  }

  const allowedValues = Object.values(DirectionsEnum)
  const invalidDirection = !allowedValues.includes(parseInt(key, 10))

  if (invalidDirection) return null

  snake.changeDirection(parseInt(key, 10))
}

const input = new KeyboardInput({
  eventHandler: updateSnakeDirection,
  stopCondition: quitGame
})

input.listen()
run()
