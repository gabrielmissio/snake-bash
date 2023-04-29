class MainOutput {
  static drawBoard ({ board }) {
    const rowSize = board.length

    for (let i = 0; i < rowSize; i++) {
      const columnSize = board[i].length

      for (let j = 0; j < columnSize; j++) process.stdout.write(` ${board[i][j]}`)
      process.stdout.write('\n')
    }
  }

  static drawScore ({ score }) {
    process.stdout.write(` SCORE: ${score}\n`)
  }

  static drawGameOver () {
    process.stdout.write('\n * * * * * GAME OVER * * * * *')
  }

  static drawInstructions ({ quitKey, restartKey }) {
    process.stdout.write(` Press "${quitKey}" to quit\n`)
    process.stdout.write(` Press "${restartKey}" to restart\n\n`)
  }

  static clear () {
    console.clear()
  }
}

module.exports = MainOutput
