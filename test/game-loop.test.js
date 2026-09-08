const test = require('node:test')
const assert = require('node:assert')
const { performance } = require('node:perf_hooks')

const GameLoop = require('../src/main/game-loop')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** A clock the test drives, so scheduling can be checked without racing time. */
function makeClock () {
  let offset = 0

  return {
    now: () => performance.now() + offset,
    step: (ms) => { offset += ms }
  }
}

test('GameLoop keeps a steady cadence even when a frame is slow', async () => {
  const stamps = []
  const loop = new GameLoop({
    getInterval: () => 40,
    onTick: () => {
      stamps.push(performance.now())
      const busyUntil = performance.now() + 12
      while (performance.now() < busyUntil) { /* simulate frame work */ }
      if (stamps.length === 8) loop.stop()
    }
  })

  const startedAt = performance.now()
  loop.start()
  await wait(700)
  loop.stop()

  assert.strictEqual(stamps.length, 8)

  // Rescheduling after the work (the old approach) would drift 12ms a frame,
  // so 8 frames would land ~96ms late. The tolerance is loose because the test
  // runner runs files concurrently, but it still catches per-frame drift.
  const elapsed = stamps[stamps.length - 1] - startedAt
  assert.ok(elapsed < 8 * 40 + 80, `drifted to ${elapsed.toFixed(0)}ms`)
})

test('GameLoop survives the clock stepping backwards', async () => {
  const clock = makeClock()
  let ticks = 0
  const loop = new GameLoop({ getInterval: () => 25, now: clock.now, onTick: () => { ticks++ } })

  loop.start()
  await wait(100)
  const before = ticks

  // A wall clock would leave the deadline 5s in the future and freeze the game
  // for that long. A monotonic clock never does this, and the delay is capped
  // at one interval regardless.
  clock.step(-5000)
  await wait(300)
  loop.stop()

  assert.ok(before > 0, 'should have ticked before the step')
  assert.ok(ticks - before >= 6, `froze after the step: only ${ticks - before} frames in 300ms`)
})

test('GameLoop does not burst when the clock steps forwards', async () => {
  const clock = makeClock()
  const stamps = []
  const loop = new GameLoop({
    getInterval: () => 25,
    now: clock.now,
    onTick: () => stamps.push(performance.now())
  })

  loop.start()
  await wait(100)
  clock.step(5000)
  await wait(300)
  loop.stop()

  const gaps = stamps.slice(1).map((stamp, i) => stamp - stamps[i])
  const backToBack = gaps.filter((gap) => gap < 5).length

  assert.strictEqual(backToBack, 0, 'must not replay the backlog as a burst of frames')
})

test('GameLoop never waits longer than one interval', () => {
  const clock = makeClock()
  const delays = []
  const loop = new GameLoop({ getInterval: () => 30, now: clock.now, onTick: () => {} })

  const realSetTimeout = global.setTimeout
  const pending = []

  // Record the delay the loop asked for, but never let a real long timer exist:
  // an orphaned one would hold the process open until it fired.
  global.setTimeout = (fn, delay) => {
    delays.push(delay)
    const handle = realSetTimeout(() => {}, 0)
    pending.push(handle)
    return handle
  }

  try {
    loop.start()
    loop.nextTickAt = clock.now() + 9999 // a deadline no clock should produce
    loop.schedule()
  } finally {
    global.setTimeout = realSetTimeout
    loop.stop()
    pending.forEach((handle) => clearTimeout(handle))
  }

  assert.ok(delays.every((delay) => delay <= 30), `unbounded delay scheduled: ${delays}`)
})

test('GameLoop reschedule applies a shorter interval to the pending frame', async () => {
  let interval = 200
  let ticks = 0
  const loop = new GameLoop({ getInterval: () => interval, onTick: () => { ticks++ } })

  loop.start()
  await wait(20)

  // Speeding up must not wait out the frame already queued at the old pace.
  interval = 20
  loop.reschedule()
  await wait(120)
  loop.stop()

  assert.ok(ticks >= 3, `speed change was ignored for a whole frame: ${ticks} ticks`)
})

test('GameLoop reschedule is a no-op while stopped', () => {
  const loop = new GameLoop({ getInterval: () => 20, onTick: () => {} })

  assert.doesNotThrow(() => loop.reschedule())
  assert.strictEqual(loop.isRunning, false)
  assert.strictEqual(loop.timer, null)
})

test('GameLoop stops cleanly and can be restarted', async () => {
  let ticks = 0
  const loop = new GameLoop({ getInterval: () => 20, onTick: () => { ticks++ } })

  loop.start()
  await wait(70)
  loop.stop()

  const afterStop = ticks
  await wait(60)

  assert.ok(afterStop > 0, 'should have ticked while running')
  assert.strictEqual(ticks, afterStop, 'must not tick after stop')
  assert.strictEqual(loop.isRunning, false)

  loop.start()
  await wait(60)
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
  await wait(80)

  assert.strictEqual(ticks, 1)
})
