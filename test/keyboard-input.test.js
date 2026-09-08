const test = require('node:test')
const assert = require('node:assert')
const { EventEmitter } = require('node:events')

const { KeyboardInput, KeyCodes } = require('../src/inputs')

const ESC = KeyCodes.ESCAPE

test('tokenize splits several arrow keys arriving in one chunk', () => {
  const keys = KeyboardInput.tokenize(KeyCodes.ARROW_UP + KeyCodes.ARROW_DOWN)

  assert.deepStrictEqual(keys, [KeyCodes.ARROW_UP, KeyCodes.ARROW_DOWN])
})

test('tokenize keeps an arrow key whole next to a plain key', () => {
  const keys = KeyboardInput.tokenize(KeyCodes.ARROW_RIGHT + 'q')

  assert.deepStrictEqual(keys, [KeyCodes.ARROW_RIGHT, 'q'])
})

test('tokenize splits plain keys one by one', () => {
  assert.deepStrictEqual(KeyboardInput.tokenize('4r+'), ['4', 'r', '+'])
})

test('tokenize understands application-mode arrows', () => {
  assert.deepStrictEqual(KeyboardInput.tokenize(KeyCodes.APP_ARROW_UP), [KeyCodes.APP_ARROW_UP])
})

test('tokenize swallows an unknown escape sequence instead of leaking its letters', () => {
  const keys = KeyboardInput.tokenize(`${ESC}[200~x`)

  assert.deepStrictEqual(keys, [ESC, 'x'])
})

test('tokenize passes control characters through', () => {
  assert.deepStrictEqual(KeyboardInput.tokenize(KeyCodes.CTRL_C), [KeyCodes.CTRL_C])
})

test('KeyboardInput delivers every key in a burst', () => {
  const stdin = new EventEmitter()
  stdin.resume = () => {}
  stdin.pause = () => {}
  stdin.setEncoding = () => {}

  const received = []
  const input = new KeyboardInput({
    stdin,
    stopCondition: () => false,
    eventHandler: (key) => received.push(key)
  })

  input.listen()
  stdin.emit('data', KeyCodes.ARROW_UP + KeyCodes.ARROW_LEFT + 'r')

  assert.deepStrictEqual(received, [KeyCodes.ARROW_UP, KeyCodes.ARROW_LEFT, 'r'])
})

test('KeyboardInput stops handing over keys once the stop condition hits', () => {
  const stdin = new EventEmitter()
  stdin.resume = () => {}
  stdin.pause = () => {}
  stdin.setEncoding = () => {}

  const received = []
  const input = new KeyboardInput({
    stdin,
    stopCondition: (key) => key === 'q',
    eventHandler: (key) => received.push(key)
  })

  input.listen()
  stdin.emit('data', 'aqb')

  assert.deepStrictEqual(received, ['a', 'q'])
})

test('KeyboardInput restores the terminal mode on close', () => {
  const stdin = new EventEmitter()
  stdin.isTTY = true
  stdin.resume = () => {}
  stdin.pause = () => {}
  stdin.setEncoding = () => {}

  const rawModeCalls = []
  stdin.setRawMode = (value) => rawModeCalls.push(value)

  const input = new KeyboardInput({ stdin, stopCondition: () => false, eventHandler: () => {} })
  input.listen()
  input.close()

  assert.deepStrictEqual(rawModeCalls, [true, false])
  assert.strictEqual(stdin.listenerCount('data'), 0)
})

test('KeyboardInput does not try to set raw mode on a pipe', () => {
  const stdin = new EventEmitter()
  stdin.isTTY = false
  stdin.resume = () => {}
  stdin.pause = () => {}
  stdin.setEncoding = () => {}
  stdin.setRawMode = () => { throw new Error('should not be called') }

  const input = new KeyboardInput({ stdin, stopCondition: () => false, eventHandler: () => {} })

  assert.doesNotThrow(() => input.listen())
  assert.doesNotThrow(() => input.close())
})
