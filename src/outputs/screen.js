const Ansi = require('./ansi')

/**
 * Draws frames without ever blanking the terminal.
 *
 * The previous frame is kept in memory, so each render only rewrites the lines
 * that actually changed, in place, as a single stdout write. Nothing is erased
 * before being repainted, which is what removes the flicker.
 */
class Screen {
  constructor ({ stdout = process.stdout, interactive = Boolean(stdout.isTTY) } = {}) {
    this.stdout = stdout
    this.interactive = interactive
    this.previousLines = []
    this.needsFullRedraw = true
  }

  /** Forces the next render to repaint every line (used on resize). */
  invalidate () {
    this.needsFullRedraw = true
  }

  render (lines) {
    if (!this.interactive) return this.renderPlain(lines)

    const frame = []

    if (this.needsFullRedraw) {
      frame.push(Ansi.CLEAR_SCREEN)
      this.previousLines = []
      this.needsFullRedraw = false
    }

    const lineCount = Math.max(lines.length, this.previousLines.length)
    for (let i = 0; i < lineCount; i++) {
      const line = lines[i] ?? ''
      if (line === this.previousLines[i]) continue

      // RESET before erasing so the erase never smears a background colour.
      frame.push(Ansi.moveTo(i + 1), line, Ansi.RESET, Ansi.ERASE_LINE_RIGHT)
    }

    this.previousLines = [...lines]
    if (frame.length === 0) return

    frame.push(Ansi.moveTo(lines.length + 1))
    this.stdout.write(frame.join(''))
  }

  /** Fallback for pipes and CI: plain text, no escape codes. */
  renderPlain (lines) {
    this.previousLines = [...lines]
    this.stdout.write(`${lines.join('\n')}\n`)
  }
}

module.exports = Screen
