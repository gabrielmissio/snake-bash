#!/usr/bin/env node

const Outputs = require('../outputs')
const { KeyboardInput } = require('../inputs')
const { DirectionsEnum } = require('../utils/enums')
const { RUNNING, GAMEOVER } = require('../utils/enums/status-enum')
const { makeGameManager } = require('./game-manager-factory')

const defaultOutputMode = 'MainOutput'
const outputMode = process.env.OUTPUT_MODE ?? defaultOutputMode
const output = Outputs[outputMode]

const gameManager = makeGameManager()
const { board, snake } = gameManager.properties

let snakeFrameDirection = snake.currentDirection
let intervalBetweenFramesInMilliseconds = 100

function nextFrame () {
  snake.changeDirection(snakeFrameDirection)
  snake.move({
    isScore: () => gameManager.isScore(),
    isGameOver: () => gameManager.isGameOver(),
    gameOverHandler: () => gameManager.gameOverHandler(),
    scoreHandler: () => gameManager.scoreHandler()
  })
  board.updateSnake({ snake })

  drawFrameState()

  if (gameManager.properties.status === RUNNING) {
    run()
  }
}

function drawFrameState () {
  output.clear()

  output.drawInstructions({ quitKey: 'q', restartKey: 'r' })
  output.drawGameplayInfo({
    score: gameManager.properties.score,
    framesPerSecond: (1000 / intervalBetweenFramesInMilliseconds).toFixed(2),
  })
  output.drawBoard({ board: board.properties })

  if (gameManager.properties.status === GAMEOVER) {
    output.drawGameOver()
  }
}

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
  if (key === '+') {
    if (intervalBetweenFramesInMilliseconds > 0) {
      intervalBetweenFramesInMilliseconds -= 10
    }
    if (gameManager.properties.status === GAMEOVER) drawFrameState()
  } else if (key === '-') {
    intervalBetweenFramesInMilliseconds += 10
    if (gameManager.properties.status === GAMEOVER) drawFrameState()
  } else if (key === 'r') {
    resetGame()
  }

  const parsedKey = parseInput(key)
  const allowedKey = Object.values(DirectionsEnum).includes(parsedKey)

  if (allowedKey) {
    snakeFrameDirection = parsedKey
  }
}

const input = new KeyboardInput({
  eventHandler: updateSnakeDirection,
  stopCondition: quitGame
})

input.listen()
run()
