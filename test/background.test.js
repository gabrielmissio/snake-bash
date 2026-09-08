const test = require('node:test')
const assert = require('node:assert')

const { TraditionalBackground } = require('../src/backgrounds')
const { CostumesEnum: { BRICK, EMPTY } } = require('../src/utils/enums')

test('TraditionalBackground builds the requested dimensions', () => {
  const background = TraditionalBackground.makeBackground({ row: 7, column: 11 })

  assert.strictEqual(background.length, 7)
  assert.ok(background.every((row) => row.length === 11))
})

test('TraditionalBackground walls every edge and leaves the inside empty', () => {
  const background = TraditionalBackground.makeBackground({ row: 6, column: 6 })

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const isEdge = i === 0 || j === 0 || i === 5 || j === 5
      assert.strictEqual(background[i][j], isEdge ? BRICK : EMPTY, `cell ${i},${j}`)
    }
  }
})
