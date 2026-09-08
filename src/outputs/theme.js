const CSI = '\u001B['

const STYLES = {
  reset: `${CSI}0m`,
  bold: `${CSI}1m`,
  dim: `${CSI}2m`,
  red: `${CSI}31m`,
  green: `${CSI}32m`,
  yellow: `${CSI}33m`,
  blue: `${CSI}34m`,
  magenta: `${CSI}35m`,
  cyan: `${CSI}36m`,
  brightGreen: `${CSI}92m`,
  brightYellow: `${CSI}93m`
}

class Theme {
  constructor ({ enabled = true } = {}) {
    this.enabled = enabled
  }

  /** True unless the user or the environment asked for plain output. */
  static isColorSupported ({ stdout = process.stdout, env = process.env } = {}) {
    if (env.NO_COLOR !== undefined && env.NO_COLOR !== '') return false
    if (env.TERM === 'dumb') return false
    return Boolean(stdout.isTTY)
  }

  paint (text, ...styles) {
    if (!this.enabled || styles.length === 0) return text

    const prefix = styles.map((style) => STYLES[style] ?? '').join('')
    return `${prefix}${text}${STYLES.reset}`
  }
}

module.exports = Theme
