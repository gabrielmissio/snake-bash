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

const SIZE_LIMITS = Object.freeze({
  // Below 5 there is no room left inside the walls for a playable board.
  MIN: 5,
  // A board is allocated cell by cell, so an unbounded size is a way to eat
  // every byte of RAM on the machine before the process finally dies. 200 is
  // already far past what any terminal can show: MainOutput.fits needs
  // `columns * 2 + 2` columns to draw one.
  MAX: 200
})

const SIZE_PATTERN = /^(\d+)(?:x(\d+))?$/i

const isControlCharacter = (code) => code < 0x20 || (code >= 0x7f && code <= 0x9f)

class Cli {
  static get DEFAULTS () { return DEFAULTS }
  static get SPEED_LIMITS () { return SPEED_LIMITS }
  static get SIZE_LIMITS () { return SIZE_LIMITS }

  /**
   * Arguments are echoed back in error messages, so control characters have to
   * be neutralised first. An escape sequence smuggled in through argv would
   * otherwise reach the terminal verbatim and be acted on rather than read.
   */
  static describe (value) {
    return Array.from(String(value), (character) => {
      const code = character.charCodeAt(0)

      return isControlCharacter(code)
        ? `\\x${code.toString(16).padStart(2, '0')}`
        : character
    }).join('')
  }

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
        default: {
          if (arg.startsWith('-')) throw new Error(`Unknown option: ${Cli.describe(arg)}`)

          // Silently ignoring a stray argument meant `snake-bash 20` started a
          // default 15x15 game with no hint that the size had been dropped.
          const hint = SIZE_PATTERN.test(arg) ? ` (did you mean "--size ${Cli.describe(arg)}"?)` : ''
          throw new Error(`Unexpected argument: ${Cli.describe(arg)}${hint}`)
        }
      }
    }

    return options
  }

  /** Accepts "20" (square) or "20x30" (rows x columns). */
  static parseSize (value) {
    const match = SIZE_PATTERN.exec(value ?? '')
    if (!match) throw new Error(`Invalid --size: ${Cli.describe(value)} (expected N or ROWSxCOLUMNS)`)

    const rows = Number(match[1])
    const columns = match[2] ? Number(match[2]) : rows
    const { MIN, MAX } = SIZE_LIMITS

    if (rows < MIN || columns < MIN) throw new Error(`Invalid --size: minimum is ${MIN}`)
    if (rows > MAX || columns > MAX) throw new Error(`Invalid --size: maximum is ${MAX}`)

    return { rows, columns }
  }

  /** Returns the frame interval in milliseconds, which is what the loop uses. */
  static parseFps (value) {
    const fps = Number(value)
    if (!Number.isFinite(fps) || fps <= 0) throw new Error(`Invalid --fps: ${Cli.describe(value)}`)

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
      '    -s, --size <N|ROWSxCOLS>  board size, 5-200      (default: 15x15)',
      '    -f, --fps  <N>            starting speed         (default: 10)',
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
