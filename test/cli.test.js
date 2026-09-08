const test = require('node:test')
const assert = require('node:assert')

const Cli = require('../src/main/cli')

test('Cli falls back to the classic 15x15 board', () => {
  const options = Cli.parse([])

  assert.strictEqual(options.rows, 15)
  assert.strictEqual(options.columns, 15)
  assert.strictEqual(options.interval, 100)
  assert.strictEqual(options.color, true)
})

test('Cli reads a square size', () => {
  assert.deepStrictEqual(Cli.parseSize('20'), { rows: 20, columns: 20 })
})

test('Cli reads a rectangular size', () => {
  assert.deepStrictEqual(Cli.parseSize('12x30'), { rows: 12, columns: 30 })
})

test('Cli rejects a board too small to play on', () => {
  assert.throws(() => Cli.parseSize('4'), /minimum is 5/)
})

test('Cli rejects a malformed size', () => {
  assert.throws(() => Cli.parseSize('big'), /Invalid --size/)
  assert.throws(() => Cli.parseSize(undefined), /Invalid --size/)
})

test('Cli rejects an unknown option', () => {
  assert.throws(() => Cli.parse(['--turbo']), /Unknown option/)
})

test('Cli accepts short and long forms together', () => {
  const options = Cli.parse(['-s', '10x20', '--no-color', '-f', '15'])

  assert.strictEqual(options.rows, 10)
  assert.strictEqual(options.columns, 20)
  assert.strictEqual(options.color, false)
  assert.strictEqual(options.interval, 67)
})

test('Cli clamps an absurd speed to something playable', () => {
  const { MIN_INTERVAL, MAX_INTERVAL } = Cli.SPEED_LIMITS

  assert.strictEqual(Cli.parse(['-f', '9999']).interval, MIN_INTERVAL)
  assert.strictEqual(Cli.parse(['-f', '0.5']).interval, MAX_INTERVAL)
})

test('Cli rejects a non-numeric speed', () => {
  assert.throws(() => Cli.parse(['-f', 'fast']), /Invalid --fps/)
  assert.throws(() => Cli.parse(['-f', '-3']), /Invalid --fps/)
})

test('Cli recognises help and version flags', () => {
  assert.strictEqual(Cli.parse(['--help']).help, true)
  assert.strictEqual(Cli.parse(['-h']).help, true)
  assert.strictEqual(Cli.parse(['--version']).version, true)
  assert.strictEqual(Cli.parse(['-v']).version, true)
})

test('Cli help text lists the controls', () => {
  const help = Cli.helpText()

  for (const fragment of ['--size', '--fps', '--no-color', 'pause', 'restart', 'quit']) {
    assert.ok(help.includes(fragment), `help should mention ${fragment}`)
  }
})
