/**
 * Plain, escape-free output for debugging and for piped/non-TTY runs.
 * Selected with OUTPUT_MODE=DevelopmentOutput.
 */
class DevelopmentOutput {
  constructor ({ screen }) {
    this.screen = screen
  }

  render ({ board, score, bestScore, framesPerSecond, status }) {
    this.screen.render([
      `score=${score} best=${bestScore} fps=${framesPerSecond} status=${status}`,
      ...board.map((row) => row.join('')),
      ''
    ])
  }
}

module.exports = DevelopmentOutput
