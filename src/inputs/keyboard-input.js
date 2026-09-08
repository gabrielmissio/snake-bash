const KeyCodes = require('./key-codes')

const ESCAPE = KeyCodes.ESCAPE
const CSI_FINAL_BYTE = /[@-~]/
const ARROW_FINAL_BYTE = /[A-D]/

class KeyboardInput {
  constructor ({ stopCondition, eventHandler, stdin = process.stdin } = {}) {
    this.stopCondition = stopCondition
    this.eventHandler = eventHandler
    this.stdin = stdin
    this.isRaw = false
    this.onData = (chunk) => this.handleChunk(chunk)
  }

  /**
   * A single 'data' event can carry several keystrokes, and an arrow key is
   * three bytes. Splitting the chunk keeps fast input from being misread as
   * stray letters (an arrow leaking through as a literal "A").
   */
  static tokenize (chunk) {
    const keys = []
    let i = 0

    while (i < chunk.length) {
      if (chunk[i] !== ESCAPE) {
        keys.push(chunk[i])
        i += 1
        continue
      }

      const introducer = chunk[i + 1]
      const finalByte = chunk[i + 2]
      const isArrow = (introducer === '[' || introducer === 'O') && ARROW_FINAL_BYTE.test(finalByte ?? '')

      if (isArrow) {
        keys.push(chunk.slice(i, i + 3))
        i += 3
        continue
      }

      // Unknown escape sequence: swallow it whole so its payload never leaks
      // through as normal keystrokes.
      let end = i + 1
      if (introducer === '[' || introducer === 'O') end += 1
      while (end < chunk.length && !CSI_FINAL_BYTE.test(chunk[end])) end += 1

      keys.push(ESCAPE)
      i = end + 1
    }

    return keys
  }

  config () {
    if (this.stdin.isTTY && this.stdin.setRawMode) {
      this.stdin.setRawMode(true)
      this.isRaw = true
    }

    this.stdin.resume()
    this.stdin.setEncoding('utf8')
  }

  listen () {
    this.config()
    this.stdin.on('data', this.onData)
  }

  handleChunk (chunk) {
    for (const key of KeyboardInput.tokenize(chunk)) {
      const shouldStop = this.stopCondition(key)
      this.eventHandler(key, { shouldStop })

      if (shouldStop) return
    }
  }

  close () {
    this.stdin.removeListener('data', this.onData)

    if (this.isRaw && this.stdin.setRawMode) {
      this.stdin.setRawMode(false)
      this.isRaw = false
    }

    this.stdin.pause()
  }
}

module.exports = KeyboardInput
