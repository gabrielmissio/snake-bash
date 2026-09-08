const CSI = '\u001B['

const Ansi = {
  ENTER_ALT_SCREEN: `${CSI}?1049h`,
  LEAVE_ALT_SCREEN: `${CSI}?1049l`,
  HIDE_CURSOR: `${CSI}?25l`,
  SHOW_CURSOR: `${CSI}?25h`,
  CLEAR_SCREEN: `${CSI}2J`,
  ERASE_LINE_RIGHT: `${CSI}K`,
  RESET: `${CSI}0m`,

  moveTo (line, column = 1) {
    return `${CSI}${line};${column}H`
  }
}

module.exports = Object.freeze(Ansi)
