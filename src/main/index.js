#!/usr/bin/env node

const Outputs = require('../outputs')
const { KeyboardInput } = require('../inputs')
const { DirectionsEnum } = require('../utils/enums')
const { GAMEOVER } = require('../utils/enums/status-enum')
const { makeGameManager } = require('./game-manager-factory')

const defaultOutputMode = 'MainOutput'
const outputMode = process.env.OUTPUT_MODE ?? defaultOutputMode
const output = Outputs[outputMode]

const gameManager = makeGameManager()
const { board, snake } = gameManager.properties

let snakeFrameDirection = snake.currentDirection

function nextFrame () {
  output.clear()
  output.drawInstructions({ quitKey: 'q', restartKey: 'r' })

  snake.changeDirection(snakeFrameDirection)
  const { score } = gameManager.properties
  output.drawScore({ score })

  snake.move({
    isScore: () => gameManager.isScore(),
    isGameOver: () => gameManager.isGameOver(),
    gameOverHandler: () => gameManager.gameOverHandler(),
    scoreHandler: () => gameManager.scoreHandler()
  })

  board.updateSnake({ snake })
  output.drawBoard({ board: board.properties })

  const isGameOver = gameManager.properties.status === GAMEOVER
  return isGameOver ? output.drawGameOver() : run()
}

const intervalBetweenFramesInMilliseconds = 120

function run () {
  setTimeout(nextFrame, intervalBetweenFramesInMilliseconds)
}

function quitGame (key) {
  return key === 'q'
}

function resetGame () {
  const isGameOverStatus = gameManager.properties.status === GAMEOVER
  if (isGameOverStatus) run()

  gameManager.reset()
  snakeFrameDirection = snake.currentDirection
}

function parseInput (key) {
  const arrowKeys = {
    '\u001B[A': DirectionsEnum.UP,
    '\u001B[B': DirectionsEnum.DOWN,
    '\u001B[C': DirectionsEnum.RIGHT,
    '\u001B[D': DirectionsEnum.LEFT
  }

  return arrowKeys[key] ?? parseInt(key, 10)
}

function updateSnakeDirection (key) {
  if (key === 'r') resetGame()
  const parsedKey = parseInput(key)

  const allowedKey = Object.values(DirectionsEnum).includes(parsedKey)
  if (!allowedKey) return

  snakeFrameDirection = parsedKey
}

const input = new KeyboardInput({
  eventHandler: updateSnakeDirection,
  stopCondition: quitGame
})

input.listen()
run()
