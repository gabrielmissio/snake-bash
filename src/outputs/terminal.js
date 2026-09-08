const Ansi = require('./ansi')

/**
 * Owns the terminal modes the game switches on, and guarantees they are put
 * back however the process ends (quit key, Ctrl+C, signal, or crash).
 */
class Terminal {
  constructor ({ stdout = process.stdout } = {}) {
    this.stdout = stdout
    this.interactive = Boolean(stdout.isTTY)
    this.isOpen = false
    this.onResize = null
    this.handleResize = () => this.onResize && this.onResize()
  }

  get size () {
    return {
      rows: this.stdout.rows || 24,
      columns: this.stdout.columns || 80
    }
  }

  open () {
    if (this.isOpen) return
    this.isOpen = true

    if (this.interactive) {
      // The alternate screen keeps the game out of the scrollback, so quitting
      // gives the user their prompt and history back untouched.
      // The Screen clears once on its first frame; doing it here too would be
      // a second full-screen paint for nothing.
      this.stdout.write(Ansi.ENTER_ALT_SCREEN + Ansi.HIDE_CURSOR)
      this.stdout.on('resize', this.handleResize)
    }
  }

  close () {
    if (!this.isOpen) return
    this.isOpen = false

    if (this.interactive) {
      this.stdout.removeListener('resize', this.handleResize)
      this.stdout.write(Ansi.RESET + Ansi.SHOW_CURSOR + Ansi.LEAVE_ALT_SCREEN)
    }
  }
}

module.exports = Terminal
