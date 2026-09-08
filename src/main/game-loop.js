/**
 * Fixed-timestep loop.
 *
 * The old loop rescheduled itself with `setTimeout(next, interval)` after doing
 * the frame's work, so every frame ran late by however long that work took and
 * the drift accumulated. This one schedules against an absolute deadline, which
 * keeps the cadence even -- an uneven cadence reads as stutter.
 */
class GameLoop {
  constructor ({ onTick, getInterval }) {
    this.onTick = onTick
    this.getInterval = getInterval
    this.timer = null
    this.running = false
    this.nextTickAt = 0
  }

  get isRunning () {
    return this.running
  }

  start () {
    if (this.running) return

    this.running = true
    this.nextTickAt = Date.now() + this.getInterval()
    this.schedule()
  }

  stop () {
    this.running = false

    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  schedule () {
    const delay = Math.max(0, this.nextTickAt - Date.now())
    this.timer = setTimeout(() => this.tick(), delay)
  }

  tick () {
    this.timer = null
    if (!this.running) return

    this.nextTickAt += this.getInterval()

    // If we fell badly behind (a suspended laptop, a stalled terminal) drop the
    // backlog instead of replaying it as a burst of catch-up frames.
    const now = Date.now()
    if (this.nextTickAt < now) this.nextTickAt = now + this.getInterval()

    this.onTick()

    // onTick may have stopped the loop (game over, pause, quit).
    if (this.running) this.schedule()
  }
}

module.exports = GameLoop
