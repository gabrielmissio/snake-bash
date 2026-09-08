const test = require('node:test')
const assert = require('node:assert')

const { Board, Snake, Target } = require('../src/components')
const { TraditionalBackground } = require('../src/backgrounds')
const { CostumesEnum: { SNAKE, TARGET, EMPTY, BRICK } } = require('../src/utils/enums')

const makeBoard = (boardSize = { row: 8, column: 8 }) =>
  new Board({ background: TraditionalBackground, boardSize })

test('Board paints every segment of the snake', () => {
  const board = makeBoard()
  const snake = new Snake()
  snake.properties.body = [{ row: 3, column: 4 }, { row: 3, column: 3 }]

  board.updateSnake({ snake })

  assert.strictEqual(board.getCostumeAt({ row: 3, column: 4 }), SNAKE)
  assert.strictEqual(board.getCostumeAt({ row: 3, column: 3 }), SNAKE)
})

test('Board clears the previous body before repainting', () => {
  const board = makeBoard()
  const snake = new Snake()

  snake.properties.body = [{ row: 3, column: 4 }, { row: 3, column: 3 }]
  board.updateSnake({ snake })

  snake.properties.body = [{ row: 3, column: 5 }, { row: 3, column: 4 }]
  board.updateSnake({ snake })

  assert.strictEqual(board.getCostumeAt({ row: 3, column: 3 }), EMPTY)
})

test('Board reports positions outside the grid as undefined', () => {
  const board = makeBoard()

  assert.strictEqual(board.getCostumeAt({ row: -1, column: 0 }), undefined)
  assert.strictEqual(board.getCostumeAt({ row: 0, column: 99 }), undefined)
  assert.strictEqual(board.isInside({ row: 8, column: 0 }), false)
  assert.strictEqual(board.isInside({ row: 1, column: 1 }), true)
})

test('Board lists only empty cells as available', () => {
  const board = makeBoard()
  const snake = new Snake()
  snake.properties.body = [{ row: 3, column: 4 }, { row: 3, column: 3 }]
  board.updateSnake({ snake })
  board.updateTarget({ target: new Target({ startingPosition: { row: 5, column: 5 } }) })

  const available = board.getAvailablePositions()
  const interiorCells = 6 * 6

  assert.strictEqual(available.length, interiorCells - 3)
  assert.ok(available.every(({ row, column }) => board.getCostumeAt({ row, column }) === EMPTY))
})

test('Board keeps its walls after a reset', () => {
  const board = makeBoard()
  const snake = new Snake()
  snake.properties.body = [{ row: 3, column: 4 }]
  board.updateSnake({ snake })

  board.setToInitialState()

  assert.strictEqual(board.getCostumeAt({ row: 3, column: 4 }), EMPTY)
  assert.strictEqual(board.getCostumeAt({ row: 0, column: 0 }), BRICK)
})

test('Board ignores a target that has no position yet', () => {
  const board = makeBoard()

  assert.doesNotThrow(() => board.updateTarget({ target: { position: undefined } }))
})

test('Board places the target on the grid', () => {
  const board = makeBoard()
  board.updateTarget({ target: new Target({ startingPosition: { row: 4, column: 4 } }) })

  assert.strictEqual(board.getCostumeAt({ row: 4, column: 4 }), TARGET)
})
