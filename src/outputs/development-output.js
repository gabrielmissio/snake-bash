class DevelopmentOutput {
  static drawBoard ({ board }) {
    console.table(board)
  }

  static drawScore ({ score }) {
    console.log(score)
  }

  static drawGameOver () {
    console.log('GAME OVER')
  }

  static drawInstructions ({ quitKey, restartKey }) {
    process.stdout.write(`Press "${quitKey}" to quit\n`)
    process.stdout.write(`Press "${restartKey}" to restart\n\n`)
  }

  static clear () {
    console.clear()
  }
}

module.exports = DevelopmentOutput
