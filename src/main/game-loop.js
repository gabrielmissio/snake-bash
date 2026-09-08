const { performance } = require('node:perf_hooks')

/**
 * Fixed-timestep loop.
 *
 * Frames are scheduled against an absolute deadline rather than by restarting
 * a timer after the frame's work, so the cadence stays even instead of drifting
 * by however long each frame took.
 *
 * The deadline is measured on a monotonic clock. Wall-clock time is not safe
 * here: it steps whenever the machine corrects it (NTP, resuming a VM, the WSL2
 * clock resyncing after the host sleeps). A backwards step would leave the
 * deadline that far in the future and freeze the game for exactly that long.
 */
class GameLoop {
  constructor ({ onTick, getInterval, now = () => performance.now() }) {
    this.onTick = onTick
    this.getInterval = getInterval
    this.now = now
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
    this.nextTickAt = this.now() + this.getInterval()
    this.schedule()
  }

  stop () {
    this.running = false

    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /** Re-arms the pending frame, so a speed change is felt immediately. */
  reschedule () {
    if (!this.running) return

    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.nextTickAt = Math.min(this.nextTickAt, this.now() + this.getInterval())
    this.schedule()
  }

  schedule () {
    const interval = this.getInterval()
    const remaining = this.nextTickAt - this.now()

    // A frame must never wait longer than one interval, whatever the deadline
    // says. This is what keeps a clock anomaly from stalling the game.
    const delay = Math.min(interval, Math.max(0, remaining))

    this.timer = setTimeout(() => this.tick(), delay)
  }

  tick () {
    this.timer = null
    if (!this.running) return

    const interval = this.getInterval()
    this.nextTickAt += interval

    // Resync when the deadline stops making sense: behind us because we fell
    // back (a stalled terminal, a suspended machine), or implausibly far ahead.
    // Replaying the backlog as a burst of frames would be as bad as stalling.
    const now = this.now()
    const hasFallenBehind = this.nextTickAt < now
    const isTooFarAhead = this.nextTickAt > now + interval
    if (hasFallenBehind || isTooFarAhead) this.nextTickAt = now + interval

    this.onTick()

    // onTick may have stopped the loop (game over, pause, quit).
    if (this.running) this.schedule()
  }
}

module.exports = GameLoop
