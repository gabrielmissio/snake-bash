const test = require('node:test')
const assert = require('node:assert')

const { Snake } = require('../src/components')
const { DirectionsEnum } = require('../src/utils/enums')

test('Snake starts as a single segment facing right', () => {
  const snake = new Snake()

  assert.deepStrictEqual(snake.properties.body, [{ row: 2, column: 2 }])
  assert.strictEqual(snake.properties.currentDirection, DirectionsEnum.RIGHT)
})

test('Snake refuses to reverse into itself', () => {
  const snake = new Snake()

  assert.strictEqual(snake.changeDirection(DirectionsEnum.LEFT), false)
  assert.strictEqual(snake.applyQueuedDirection(), DirectionsEnum.RIGHT)
})

test('Snake queues two quick turns instead of dropping the first', () => {
  const snake = new Snake()

  assert.strictEqual(snake.changeDirection(DirectionsEnum.UP), true)
  assert.strictEqual(snake.changeDirection(DirectionsEnum.LEFT), true)

  assert.strictEqual(snake.applyQueuedDirection(), DirectionsEnum.UP)
  assert.strictEqual(snake.applyQueuedDirection(), DirectionsEnum.LEFT)
})

test('Snake rejects a turn that reverses a already queued turn', () => {
  const snake = new Snake()
  snake.changeDirection(DirectionsEnum.UP)

  assert.strictEqual(snake.changeDirection(DirectionsEnum.DOWN), false)
})

test('Snake caps the queue so old input cannot pile up', () => {
  const snake = new Snake()
  snake.changeDirection(DirectionsEnum.UP)
  snake.changeDirection(DirectionsEnum.LEFT)

  assert.strictEqual(snake.changeDirection(DirectionsEnum.DOWN), false)
  assert.strictEqual(snake.properties.queuedDirections.length, 2)
})

test('Snake ignores a repeated direction', () => {
  const snake = new Snake()

  assert.strictEqual(snake.changeDirection(DirectionsEnum.RIGHT), false)
})

test('Snake ignores values that are not directions', () => {
  const snake = new Snake()

  assert.strictEqual(snake.changeDirection(42), false)
  assert.strictEqual(snake.changeDirection(undefined), false)
})

test('Snake moves without growing when nothing is scored', () => {
  const snake = new Snake()
  const noop = () => false

  snake.move({ isScore: noop, isGameOver: noop, scoreHandler: noop, gameOverHandler: noop })

  assert.deepStrictEqual(snake.properties.body, [{ row: 2, column: 3 }])
})

test('Snake keeps the new head when it scores', () => {
  const snake = new Snake()

  snake.move({
    isScore: () => true,
    isGameOver: () => false,
    scoreHandler: () => {},
    gameOverHandler: () => {}
  })

  assert.deepStrictEqual(snake.properties.body, [{ row: 2, column: 3 }, { row: 2, column: 2 }])
})

test('Snake resets back to its starting state', () => {
  const snake = new Snake()
  snake.changeDirection(DirectionsEnum.UP)
  snake.properties.body.push({ row: 9, column: 9 })

  snake.setToInitialState()

  assert.deepStrictEqual(snake.properties.body, [{ row: 2, column: 2 }])
  assert.deepStrictEqual(snake.properties.queuedDirections, [])
  assert.strictEqual(snake.properties.currentDirection, DirectionsEnum.RIGHT)
})

test('Snake rejects an unknown current direction when moving', () => {
  const snake = new Snake()
  snake.properties.currentDirection = 99

  assert.throws(() => snake.getNextPosition(), /INVALID DIRECTION/)
})
