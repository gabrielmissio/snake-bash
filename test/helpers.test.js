const test = require('node:test')
const assert = require('node:assert')

const { GetRandomArbitrary } = require('../src/utils/helpers')

test('GetRandomArbitrary reaches both ends of the range', () => {
  const seen = new Set()
  for (let i = 0; i < 20000; i++) seen.add(GetRandomArbitrary.get({ min: 0, max: 4 }))

  assert.deepStrictEqual([...seen].sort((a, b) => a - b), [0, 1, 2, 3, 4])
})

test('GetRandomArbitrary never leaves the range', () => {
  for (let i = 0; i < 5000; i++) {
    const value = GetRandomArbitrary.get({ min: 3, max: 7 })
    assert.ok(value >= 3 && value <= 7, `out of range: ${value}`)
  }
})

test('GetRandomArbitrary handles a single-value range', () => {
  assert.strictEqual(GetRandomArbitrary.get({ min: 2, max: 2 }), 2)
})

test('GetRandomArbitrary rejects an inverted range', () => {
  assert.throws(() => GetRandomArbitrary.get({ min: 5, max: 1 }), /INVALID RANGE/)
})
