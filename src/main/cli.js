const { name, version, description } = require('../../package.json')

const DEFAULTS = Object.freeze({
  rows: 15,
  columns: 15,
  interval: 100, // milliseconds per frame, i.e. 10 fps
  color: true,
  help: false,
  version: false
})

const SPEED_LIMITS = Object.freeze({
  MIN_INTERVAL: 40, // 25 fps
  MAX_INTERVAL: 500, // 2 fps
  STEP: 10
})

class Cli {
  static get DEFAULTS () { return DEFAULTS }
  static get SPEED_LIMITS () { return SPEED_LIMITS }

  static parse (argv = []) {
    const options = { ...DEFAULTS }

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i]
      const readValue = () => argv[++i]

      switch (arg) {
        case '-h':
        case '--help':
          options.help = true
          break
        case '-v':
        case '--version':
          options.version = true
          break
        case '--no-color':
          options.color = false
          break
        case '-s':
        case '--size': {
          const { rows, columns } = Cli.parseSize(readValue())
          options.rows = rows
          options.columns = columns
          break
        }
        case '-f':
        case '--fps':
          options.interval = Cli.parseFps(readValue())
          break
        default:
          if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
      }
    }

    return options
  }

  /** Accepts "20" (square) or "20x30" (rows x columns). */
  static parseSize (value) {
    const match = /^(\d+)(?:x(\d+))?$/i.exec(value ?? '')
    if (!match) throw new Error(`Invalid --size: ${value} (expected N or ROWSxCOLUMNS)`)

    const rows = Number(match[1])
    const columns = match[2] ? Number(match[2]) : rows

    // Below 5 there is no room left inside the walls for a playable board.
    if (rows < 5 || columns < 5) throw new Error('Invalid --size: minimum is 5')

    return { rows, columns }
  }

  /** Returns the frame interval in milliseconds, which is what the loop uses. */
  static parseFps (value) {
    const fps = Number(value)
    if (!Number.isFinite(fps) || fps <= 0) throw new Error(`Invalid --fps: ${value}`)

    return Cli.clampInterval(1000 / fps)
  }

  static clampInterval (interval) {
    const { MIN_INTERVAL, MAX_INTERVAL } = SPEED_LIMITS

    return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(interval)))
  }

  static helpText () {
    return [
      '',
      `  ${name} v${version}`,
      `  ${description}`,
      '',
      '  Usage: snake-bash [options]',
      '',
      '  Options:',
      '    -s, --size <N|ROWSxCOLS>  board size            (default: 15x15)',
      '    -f, --fps  <N>            starting speed        (default: 10)',
      '        --no-color            disable colours',
      '    -h, --help                show this help',
      '    -v, --version             show the version',
      '',
      '  Controls:',
      '    arrow keys or 4/6/8/2     move the snake',
      '    + / -                     speed up / slow down',
      '    p or space                pause',
      '    r                         restart',
      '    q or Ctrl+C               quit',
      ''
    ].join('\n')
  }
}

module.exports = Cli
