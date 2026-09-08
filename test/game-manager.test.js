const test = require('node:test')
const assert = require('node:assert')

const { Board, Snake, Target } = require('../src/components')
const { TraditionalBackground } = require('../src/backgrounds')
const GameManager = require('../src/main/game-manager')
const { makeGameManager } = require('../src/main/game-manager-factory')
const { StatusEnum, CostumesEnum: { EMPTY } } = require('../src/utils/enums')

/**
 * Builds a manager whose board reflects `paintedBody`, then puts `movedBody`
 * on the snake. That models the moment collision is tested: the head has been
 * pushed on, but the board still shows the previous frame.
 */
function makeScenario ({ paintedBody, movedBody, targetPosition = { row: 6, column: 6 } }) {
  const board = new Board({ background: TraditionalBackground, boardSize: { row: 10, column: 10 } })
  const snake = new Snake()

  snake.properties.body = paintedBody
  board.updateSnake({ snake })

  const target = new Target({ startingPosition: targetPosition })
  board.updateTarget({ target })

  snake.properties.body = movedBody

  return new GameManager({ board, snake, target })
}

test('turning into the tail cell the snake is vacating is legal', () => {
  const body = [{ row: 5, column: 5 }, { row: 5, column: 6 }, { row: 6, column: 6 }, { row: 6, column: 5 }]
  const gameManager = makeScenario({
    paintedBody: body,
    movedBody: [{ row: 6, column: 5 }, ...body]
  })

  assert.strictEqual(gameManager.isGameOver(), false)
})

test('the tail does not vacate when the snake is about to grow', () => {
  const body = [{ row: 5, column: 5 }, { row: 5, column: 6 }, { row: 6, column: 6 }, { row: 6, column: 5 }]
  const gameManager = makeScenario({
    paintedBody: body,
    movedBody: [{ row: 6, column: 5 }, ...body],
    targetPosition: { row: 6, column: 5 }
  })

  assert.strictEqual(gameManager.isGameOver(), true)
})

test('running into the middle of the body is still fatal', () => {
  const body = [{ row: 5, column: 5 }, { row: 5, column: 6 }, { row: 6, column: 6 }, { row: 6, column: 5 }]
  const gameManager = makeScenario({
    paintedBody: body,
    movedBody: [{ row: 6, column: 6 }, ...body]
  })

  assert.strictEqual(gameManager.isGameOver(), true)
})

test('running into a wall is still fatal', () => {
  const gameManager = makeScenario({
    paintedBody: [{ row: 1, column: 5 }, { row: 2, column: 5 }],
    movedBody: [{ row: 0, column: 5 }, { row: 1, column: 5 }, { row: 2, column: 5 }]
  })

  assert.strictEqual(gameManager.isGameOver(), true)
})

test('game over leaves the wall intact instead of painting the head on it', () => {
  const gameManager = makeScenario({
    paintedBody: [{ row: 1, column: 5 }, { row: 2, column: 5 }],
    movedBody: [{ row: 0, column: 5 }, { row: 1, column: 5 }, { row: 2, column: 5 }]
  })
  const { board, snake } = gameManager.properties

  gameManager.gameOverHandler()
  board.updateSnake({ snake })

  assert.strictEqual(gameManager.properties.status, StatusEnum.GAMEOVER)
  assert.strictEqual(board.getCostumeAt({ row: 0, column: 5 }), '#')
})

test('scoring increases the score and moves the target off the snake', () => {
  const gameManager = makeScenario({
    paintedBody: [{ row: 5, column: 5 }],
    movedBody: [{ row: 5, column: 6 }, { row: 5, column: 5 }],
    targetPosition: { row: 5, column: 6 }
  })

  assert.strictEqual(gameManager.isScore(), true)

  gameManager.scoreHandler()
  const { score, bestScore, target, board } = gameManager.properties

  assert.strictEqual(score, 1)
  assert.strictEqual(bestScore, 1)
  assert.ok(!(target.position.row === 5 && target.position.column === 6))
  assert.strictEqual(board.getCostumeAt(target.position), '$')
})

test('best score survives a restart', () => {
  const gameManager = makeGameManager({ rows: 8, columns: 8 })
  gameManager.properties.score = 4
  gameManager.properties.bestScore = 4

  gameManager.reset()

  assert.strictEqual(gameManager.properties.score, 0)
  assert.strictEqual(gameManager.properties.bestScore, 4)
  assert.strictEqual(gameManager.properties.status, StatusEnum.RUNNING)
})

test('restart puts the snake back on the board with a fresh target', () => {
  const gameManager = makeGameManager({ rows: 8, columns: 8 })
  const { board, snake, target } = gameManager.properties

  gameManager.reset()

  assert.strictEqual(board.getCostumeAt(snake.getHeadPosition()), '*')
  assert.strictEqual(board.getCostumeAt(target.position), '$')
})

test('filling the board wins the game instead of crashing on an empty range', () => {
  const gameManager = makeGameManager({ rows: 5, columns: 5 })
  const { board, snake } = gameManager.properties

  // Occupy every interior cell with the snake. Repainting frees the cell the
  // old head sat on, so the body has to cover that one too.
  const interior = []
  for (let row = 1; row < 4; row++) {
    for (let column = 1; column < 4; column++) interior.push({ row, column })
  }
  snake.properties.body = interior
  board.updateSnake({ snake })

  assert.strictEqual(board.getAvailablePositions().length, 0)

  gameManager.scoreHandler()

  assert.strictEqual(gameManager.properties.status, StatusEnum.VICTORY)
})

test('pause toggles only while the game is playable', () => {
  const gameManager = makeGameManager({ rows: 8, columns: 8 })

  gameManager.togglePause()
  assert.strictEqual(gameManager.properties.status, StatusEnum.PAUSED)

  gameManager.togglePause()
  assert.strictEqual(gameManager.properties.status, StatusEnum.RUNNING)

  gameManager.gameOverHandler()
  gameManager.togglePause()
  assert.strictEqual(gameManager.properties.status, StatusEnum.GAMEOVER)
  assert.strictEqual(gameManager.isPlayable(), false)
})

test('a new game starts with the target on a free cell', () => {
  const gameManager = makeGameManager({ rows: 12, columns: 12 })
  const { board, target, snake } = gameManager.properties

  assert.ok(target.position)
  assert.notDeepStrictEqual(target.position, snake.getHeadPosition())
  assert.notStrictEqual(board.getCostumeAt(target.position), EMPTY)
})
