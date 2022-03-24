const { ComponentsEnum: { SNAKE_HEAD, SNAKE_BODY, TARGET, EMPITY } } = require('../../utils/enums');

class BoardFactory {
  constructor({ backgroundFactory, boardSize }) {
    const row = boardSize.row || 15;
    const column = boardSize.column || 15;

    this.board = backgroundFactory.makeBackground({ row, column });
  }

  getAvailablePositions() {
    const availablePositions = [];
    const rowSize = this.board.length;

    for (let i = 0; i < rowSize; i++) {
      const columnSize = this.board[i].length;

      for (let j = 0; j < columnSize; j++) {
        const isAvailable = this.board[i][j] === EMPITY;
        if (isAvailable) availablePositions.push({ row: i, column: j });
      }
    }
  }

  updateTarget({ target }) {
    const { row, column } = target.getCurrentPosition()
    this.board[row][column] = TARGET;
  }

  updateSnake({ snake }) {
    const headPosition = snake.getHeadPosition();
    this.board[headPosition.row][headPosition.column] = SNAKE_HEAD;

    const { body } = snake.properties;
    for (let i = 0; i < body.length; i++) {
      this.board[body[i].row][body[i].column] = SNAKE_BODY;
    }
  }
}

module.exports = BoardFactory;
