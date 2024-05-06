class MainOutput {
  static drawBoard ({ board }) {
    const rowSize = board.length

    for (let i = 0; i < rowSize; i++) {
      const columnSize = board[i].length

      for (let j = 0; j < columnSize; j++) process.stdout.write(` ${board[i][j]}`)
      process.stdout.write('\n')
    }
  }

  static drawGameplayInfo ({ score, framesPerSecond }) {
    process.stdout.write(` SCORE: ${score}`)
    process.stdout.write(` | FPS: ${framesPerSecond}\n`)
  }

  static drawGameOver () {
    process.stdout.write('\n * * * * * GAME OVER * * * * *')
  }

  static drawInstructions ({ quitKey, restartKey }) {
    process.stdout.write(` Press "${quitKey}" to quit\n`)
    process.stdout.write(` Press "${restartKey}" to restart\n`)
    process.stdout.write(' Press "+" to increase the snake\'s speed\n')
    process.stdout.write(' Press "-" to decrease the snake\'s speed\n\n')
  }

  static clear () {
    console.clear()
  }
}

module.exports = MainOutput
