const test = require('node:test')
const assert = require('node:assert')

const { MainOutput, Screen, Theme } = require('../src/outputs')
const { makeGameManager } = require('../src/main/game-manager-factory')
const { StatusEnum } = require('../src/utils/enums')

const ESC = String.fromCharCode(27)
const ANY_COLOUR = new RegExp(`${ESC}\\[(3[0-9]|9[0-9])m`)
const ANY_STYLE = new RegExp(`${ESC}\\[[0-9]+m`)

function makeOutput ({ colors = false, size = { rows: 40, columns: 120 } } = {}) {
  const chunks = []
  const stdout = { isTTY: true, write: (chunk) => chunks.push(chunk) }
  const screen = new Screen({ stdout, interactive: true })
  const output = new MainOutput({
    screen,
    theme: new Theme({ enabled: colors }),
    terminal: { interactive: true, size }
  })

  return { output, screen, chunks, get text () { return chunks.join('') } }
}

function makeState (overrides = {}) {
  const gameManager = makeGameManager({ rows: 10, columns: 10 })

  return {
    board: gameManager.properties.board.properties,
    score: 0,
    bestScore: 0,
    status: StatusEnum.RUNNING,
    framesPerSecond: '10.0',
    ...overrides
  }
}

test('MainOutput draws the score, best and speed', () => {
  const harness = makeOutput()
  harness.output.render(makeState({ score: 3, bestScore: 7 }))

  assert.match(harness.text, /SCORE 3/)
  assert.match(harness.text, /BEST 7/)
  assert.match(harness.text, /FPS 10\.0/)
})

test('MainOutput shows the game over banner only when the game is over', () => {
  const running = makeOutput()
  running.output.render(makeState())
  assert.ok(!running.text.includes('GAME OVER'))

  const over = makeOutput()
  over.output.render(makeState({ status: StatusEnum.GAMEOVER }))
  assert.match(over.text, /GAME OVER/)
})

test('MainOutput shows paused and victory banners', () => {
  const paused = makeOutput()
  paused.output.render(makeState({ status: StatusEnum.PAUSED }))
  assert.match(paused.text, /PAUSED/)

  const won = makeOutput()
  won.output.render(makeState({ status: StatusEnum.VICTORY }))
  assert.match(won.text, /YOU WIN/)
})

test('MainOutput emits no colour codes when the theme is off', () => {
  const harness = makeOutput({ colors: false })
  harness.output.render(makeState())

  const boardAndText = harness.text.split(ESC + '[K').join('')
  assert.ok(!ANY_COLOUR.test(boardAndText), 'plain mode must stay colourless')
})

test('MainOutput colours the board when the theme is on', () => {
  const harness = makeOutput({ colors: true })
  harness.output.render(makeState())

  assert.match(harness.text, ANY_COLOUR)
  assert.match(harness.text, ANY_STYLE)
})

test('MainOutput warns instead of wrapping when the window is too small', () => {
  const harness = makeOutput({ size: { rows: 8, columns: 20 } })
  harness.output.render(makeState())

  assert.match(harness.text, /Terminal too small/)
  assert.ok(!harness.text.includes('SCORE'))
})

test('MainOutput redraws nothing when the state has not changed', () => {
  const harness = makeOutput()
  const state = makeState()

  harness.output.render(state)
  const afterFirst = harness.chunks.length
  harness.output.render(state)

  assert.strictEqual(harness.chunks.length, afterFirst)
})
