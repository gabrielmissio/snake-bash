const test = require('node:test')
const assert = require('node:assert')

const GameLoop = require('../src/main/game-loop')

test('GameLoop keeps a steady cadence even when a frame is slow', async () => {
  const stamps = []
  const loop = new GameLoop({
    getInterval: () => 40,
    onTick: () => {
      stamps.push(Date.now())
      const busyUntil = Date.now() + 12
      while (Date.now() < busyUntil) { /* simulate frame work */ }
      if (stamps.length === 8) loop.stop()
    }
  })

  const startedAt = Date.now()
  loop.start()
  await new Promise((resolve) => setTimeout(resolve, 600))

  const elapsed = stamps[stamps.length - 1] - startedAt
  const expected = 40 * stamps.length

  assert.strictEqual(stamps.length, 8)
  // Rescheduling after the work (the old approach) would drift ~12ms a frame.
  assert.ok(Math.abs(elapsed - expected) < 40, `drifted by ${elapsed - expected}ms`)
})

test('GameLoop stops cleanly and can be restarted', async () => {
  let ticks = 0
  const loop = new GameLoop({ getInterval: () => 20, onTick: () => { ticks++ } })

  loop.start()
  await new Promise((resolve) => setTimeout(resolve, 70))
  loop.stop()

  const afterStop = ticks
  await new Promise((resolve) => setTimeout(resolve, 60))

  assert.ok(afterStop > 0, 'should have ticked while running')
  assert.strictEqual(ticks, afterStop, 'must not tick after stop')
  assert.strictEqual(loop.isRunning, false)

  loop.start()
  await new Promise((resolve) => setTimeout(resolve, 60))
  loop.stop()

  assert.ok(ticks > afterStop, 'should tick again after restart')
})

test('GameLoop ignores a second start', () => {
  const loop = new GameLoop({ getInterval: () => 1000, onTick: () => {} })

  loop.start()
  const firstTimer = loop.timer
  loop.start()

  assert.strictEqual(loop.timer, firstTimer)
  loop.stop()
})

test('GameLoop lets onTick stop it without scheduling another frame', async () => {
  let ticks = 0
  const loop = new GameLoop({
    getInterval: () => 15,
    onTick: () => { ticks++; loop.stop() }
  })

  loop.start()
  await new Promise((resolve) => setTimeout(resolve, 80))

  assert.strictEqual(ticks, 1)
})
