const KeyCodes = {
  ARROW_UP: '\u001B[A',
  ARROW_DOWN: '\u001B[B',
  ARROW_RIGHT: '\u001B[C',
  ARROW_LEFT: '\u001B[D',
  // Some terminals send these while in "application cursor keys" mode.
  APP_ARROW_UP: '\u001BOA',
  APP_ARROW_DOWN: '\u001BOB',
  APP_ARROW_RIGHT: '\u001BOC',
  APP_ARROW_LEFT: '\u001BOD',
  CTRL_C: '\u0003',
  CTRL_D: '\u0004',
  ESCAPE: '\u001B'
}

module.exports = Object.freeze(KeyCodes)
