#!/usr/bin/env node

const { KeyboardInput, KeyCodes } = require('../inputs')
const { DevelopmentOutput, MainOutput, Screen, Terminal, Theme } = require('../outputs')
const { DirectionsEnum, StatusEnum } = require('../utils/enums')
const { version } = require('../../package.json')
const Cli = require('./cli')
const GameLoop = require('./game-loop')
const { makeGameManager } = require('./game-manager-factory')

const { RUNNING, PAUSED } = StatusEnum
const { MIN_INTERVAL, MAX_INTERVAL, STEP } = Cli.SPEED_LIMITS

const DIRECTION_KEYS = Object.assign(Object.create(null), {
  [KeyCodes.ARROW_UP]: DirectionsEnum.UP,
  [KeyCodes.ARROW_DOWN]: DirectionsEnum.DOWN,
  [KeyCodes.ARROW_RIGHT]: DirectionsEnum.RIGHT,
  [KeyCodes.ARROW_LEFT]: DirectionsEnum.LEFT,
  [KeyCodes.APP_ARROW_UP]: DirectionsEnum.UP,
  [KeyCodes.APP_ARROW_DOWN]: DirectionsEnum.DOWN,
  [KeyCodes.APP_ARROW_RIGHT]: DirectionsEnum.RIGHT,
  [KeyCodes.APP_ARROW_LEFT]: DirectionsEnum.LEFT,
  8: DirectionsEnum.UP,
  2: DirectionsEnum.DOWN,
  6: DirectionsEnum.RIGHT,
  4: DirectionsEnum.LEFT
})

function main (argv) {
  let options

  try {
    options = Cli.parse(argv)
  } catch (error) {
    process.stderr.write(`${error.message}\n\nTry "snake-bash --help".\n`)
    process.exitCode = 1
    return
  }

  if (options.help) return process.stdout.write(Cli.helpText())
  if (options.version) return process.stdout.write(`${version}\n`)

  new Game({ options }).start()
}

class Game {
  constructor ({ options }) {
    this.options = options
    this.interval = options.interval
    this.isShuttingDown = false

    this.gameManager = makeGameManager(options)
    this.terminal = new Terminal()
    this.screen = new Screen({ interactive: this.terminal.interactive })
    this.output = this.makeOutput()

    this.loop = new GameLoop({
      onTick: () => this.tick(),
      getInterval: () => this.interval
    })

    this.input = new KeyboardInput({
      eventHandler: (key) => this.handleKey(key),
      stopCondition: (key) => Game.isQuitKey(key)
    })
  }

  makeOutput () {
    const useDevelopmentOutput = process.env.OUTPUT_MODE === 'DevelopmentOutput'
    if (useDevelopmentOutput) return new DevelopmentOutput({ screen: this.screen })

    const theme = new Theme({
      enabled: this.options.color && Theme.isColorSupported()
    })

    return new MainOutput({ screen: this.screen, theme, terminal: this.terminal })
  }

  static isQuitKey (key) {
    return key === 'q' || key === KeyCodes.CTRL_C || key === KeyCodes.CTRL_D
  }

  start () {
    this.registerShutdownHandlers()
    this.terminal.open()

    // A resize invalidates every cached line, so repaint the whole frame once.
    this.terminal.onResize = () => {
      this.screen.invalidate()
      this.draw()
    }

    this.input.listen()
    this.draw()
    this.loop.start()
  }

  tick () {
    const { snake, board } = this.gameManager.properties

    // Advancing behind the "terminal too small" notice would kill the snake
    // somewhere the player cannot see. Hold the world still until it fits.
    if (!this.canShowBoard()) return this.draw()

    snake.applyQueuedDirection()
    snake.move({
      isScore: () => this.gameManager.isScore(),
      isGameOver: () => this.gameManager.isGameOver(),
      gameOverHandler: () => this.gameManager.gameOverHandler(),
      scoreHandler: () => this.gameManager.scoreHandler()
    })
    board.updateSnake({ snake })

    this.draw()

    if (this.gameManager.properties.status !== RUNNING) this.loop.stop()
  }

  canShowBoard () {
    if (typeof this.output.fits !== 'function') return true

    return this.output.fits({ board: this.gameManager.properties.board.properties })
  }

  draw () {
    const { board, score, bestScore, status } = this.gameManager.properties

    this.output.render({
      board: board.properties,
      score,
      bestScore,
      status,
      framesPerSecond: (1000 / this.interval).toFixed(1)
    })
  }

  handleKey (key) {
    if (Game.isQuitKey(key)) return this.shutdown(0)

    const direction = DIRECTION_KEYS[key]
    if (direction !== undefined) {
      this.gameManager.properties.snake.changeDirection(direction)
      return
    }

    if (key === '+' || key === '=') return this.changeSpeed(-STEP)
    if (key === '-' || key === '_') return this.changeSpeed(STEP)
    if (key === 'p' || key === ' ') return this.togglePause()
    if (key === 'r') return this.restart()
  }

  changeSpeed (delta) {
    const next = Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, this.interval + delta))
    if (next === this.interval) return

    this.interval = next
    this.loop.reschedule()
    this.draw()
  }

  togglePause () {
    if (!this.gameManager.isPlayable()) return

    this.gameManager.togglePause()

    if (this.gameManager.properties.status === PAUSED) this.loop.stop()
    else this.loop.start()

    this.draw()
  }

  restart () {
    this.loop.stop()
    this.gameManager.reset()
    this.draw()
    this.loop.start()
  }

  registerShutdownHandlers () {
    // Happens when the output is piped into something that exits first
    // (`snake-bash | head`). That is not a crash worth a stack trace.
    process.stdout.on('error', (error) => {
      if (error.code === 'EPIPE') process.exit(0)
    })

    process.on('SIGINT', () => this.shutdown(0))
    process.on('SIGTERM', () => this.shutdown(0))
    process.on('SIGHUP', () => this.shutdown(0))

    // Without these a crash would leave the user staring at the alternate
    // screen with a hidden cursor and a terminal still in raw mode. The game
    // is synchronous today, so unhandledRejection is there to keep that true
    // for whatever gets added later.
    process.on('uncaughtException', (error) => this.shutdown(1, error))
    process.on('unhandledRejection', (error) => this.shutdown(1, error))
  }

  shutdown (exitCode = 0, error = null) {
    if (this.isShuttingDown) return
    this.isShuttingDown = true

    this.loop.stop()
    this.input.close()
    this.terminal.close()

    const { score, bestScore } = this.gameManager.properties
    if (error) process.stderr.write(`${error.stack ?? error}\n`)
    else process.stdout.write(`Thanks for playing! Score: ${score} | Best: ${bestScore}\n`)

    process.exit(exitCode)
  }
}

if (require.main === module) main(process.argv.slice(2))

module.exports = { Game, main }
