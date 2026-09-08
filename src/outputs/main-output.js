const {
  CostumesEnum: { BRICK, SNAKE, TARGET },
  StatusEnum: { GAMEOVER, PAUSED, VICTORY }
} = require('../utils/enums')

const COSTUME_STYLES = {
  [BRICK]: ['blue', 'dim'],
  [SNAKE]: ['green'],
  [TARGET]: ['brightYellow', 'bold']
}

/**
 * Builds a frame as an array of lines and hands it to the Screen, which decides
 * what actually needs to be rewritten. Nothing here touches stdout directly --
 * that is what lets the whole frame land in one write.
 */
class MainOutput {
  constructor ({ screen, theme, terminal }) {
    this.screen = screen
    this.theme = theme
    this.terminal = terminal
  }

  render (state) {
    const fitError = this.getFitError(state)
    this.screen.render(fitError ?? this.buildLines(state))
  }

  /** A board wider or taller than the window would wrap into visual noise. */
  fits ({ board }) {
    if (!this.terminal || !this.terminal.interactive) return true

    const { rows, columns } = this.terminal.size

    return rows >= board.length + 9 && columns >= board[0].length * 2 + 2
  }

  getFitError (state) {
    if (this.fits(state)) return null

    const { board } = state
    const { rows, columns } = this.terminal.size
    const requiredRows = board.length + 9
    const requiredColumns = board[0].length * 2 + 2

    return [
      '',
      ' Terminal too small.',
      '',
      ` Need at least ${requiredColumns}x${requiredRows}, got ${columns}x${rows}.`,
      ' Resize the window, or start with a smaller --size.',
      ''
    ]
  }

  buildLines (state) {
    return [
      '',
      this.buildTitle(),
      '',
      this.buildGameplayInfo(state),
      '',
      ...this.buildBoard(state),
      '',
      this.buildStatus(state),
      '',
      ...this.buildInstructions()
    ]
  }

  buildTitle () {
    return `  ${this.theme.paint('SNAKE BASH', 'brightGreen', 'bold')}`
  }

  buildGameplayInfo ({ score, bestScore, framesPerSecond }) {
    const parts = [
      `SCORE ${this.theme.paint(String(score), 'bold')}`,
      `BEST ${this.theme.paint(String(bestScore), 'bold')}`,
      `FPS ${this.theme.paint(framesPerSecond, 'bold')}`
    ]

    return `  ${parts.join(this.theme.paint('  |  ', 'dim'))}`
  }

  buildBoard ({ board }) {
    return board.map((row) => {
      const cells = row.map((costume) => {
        const styles = COSTUME_STYLES[costume]

        return ` ${styles ? this.theme.paint(costume, ...styles) : costume}`
      })

      return ` ${cells.join('')}`
    })
  }

  buildStatus ({ status }) {
    if (status === GAMEOVER) return `  ${this.theme.paint('* * * * *  GAME OVER  * * * * *', 'red', 'bold')}`
    if (status === VICTORY) return `  ${this.theme.paint('* * * * *  YOU WIN!  * * * * *', 'brightGreen', 'bold')}`
    if (status === PAUSED) return `  ${this.theme.paint('- - - - -  PAUSED  - - - - -', 'yellow', 'bold')}`

    return ''
  }

  buildInstructions () {
    const hint = (keys, label) => `  ${this.theme.paint(keys, 'cyan')} ${this.theme.paint(label, 'dim')}`

    return [
      `${hint('arrows/4682', 'move')}${hint('+/-', 'speed')}${hint('p', 'pause')}`,
      `${hint('r', 'restart')}${hint('q', 'quit')}`
    ]
  }
}

module.exports = MainOutput
