const test = require('node:test')
const assert = require('node:assert')

const { Screen, Ansi } = require('../src/outputs')

function makeStdout () {
  const chunks = []

  return {
    chunks,
    stream: { isTTY: true, write: (chunk) => chunks.push(chunk) },
    get output () { return chunks.join('') }
  }
}

test('Screen writes an unchanged frame zero times', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: true })

  screen.render(['a', 'b', 'c'])
  const afterFirst = stdout.chunks.length

  screen.render(['a', 'b', 'c'])
  screen.render(['a', 'b', 'c'])

  assert.strictEqual(afterFirst, 1)
  assert.strictEqual(stdout.chunks.length, 1, 'identical frames must not touch stdout')
})

test('Screen emits the whole frame in a single write', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: true })

  screen.render(['aaa', 'bbb', 'ccc', 'ddd', 'eee'])

  assert.strictEqual(stdout.chunks.length, 1, 'a frame must not be split across writes')
})

test('Screen rewrites only the lines that changed', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: true })

  screen.render(['keep', 'change', 'keep too'])
  stdout.chunks.length = 0

  screen.render(['keep', 'CHANGED', 'keep too'])

  const written = stdout.output
  assert.ok(written.includes('CHANGED'))
  assert.ok(!written.includes('keep too'), 'untouched lines must not be redrawn')
  assert.ok(written.includes(Ansi.moveTo(2)), 'must reposition to the changed line')
})

test('Screen never blanks the terminal after the first frame', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: true })

  screen.render(['one'])
  stdout.chunks.length = 0

  screen.render(['two'])
  screen.render(['three'])

  assert.ok(!stdout.output.includes(Ansi.CLEAR_SCREEN), 'clearing the screen is what makes it blink')
})

test('Screen erases leftovers when a frame gets shorter', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: true })

  screen.render(['one', 'two', 'three'])
  stdout.chunks.length = 0

  screen.render(['one'])

  const written = stdout.output
  assert.ok(written.includes(Ansi.moveTo(2) + Ansi.RESET + Ansi.ERASE_LINE_RIGHT))
  assert.ok(written.includes(Ansi.moveTo(3) + Ansi.RESET + Ansi.ERASE_LINE_RIGHT))
})

test('Screen repaints everything after invalidate', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: true })

  screen.render(['one', 'two'])
  stdout.chunks.length = 0

  screen.invalidate()
  screen.render(['one', 'two'])

  const written = stdout.output
  assert.ok(written.includes(Ansi.CLEAR_SCREEN))
  assert.ok(written.includes('one') && written.includes('two'))
})

test('Screen falls back to plain text when the output is not a terminal', () => {
  const stdout = makeStdout()
  const screen = new Screen({ stdout: stdout.stream, interactive: false })

  screen.render(['one', 'two'])

  assert.strictEqual(stdout.output, 'one\ntwo\n')
})
