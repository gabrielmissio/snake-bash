const {
  ComponentsEnum: { SNAKE_BODY, TARGET, EMPITY }
} = require('../utils/enums');

class Board {
  constructor({ background, boardSize }) {
    const row = (boardSize && boardSize.row) || 15;
    const column = (boardSize && boardSize.column) || 15;

    this.properties = background.makeBackground({ row, column });
  }

  getAvailablePositions() {
    const availablePositions = [];
    const rowSize = this.properties.length;

    for (let i = 0; i < rowSize; i++) {
      const columnSize = this.properties[i].length;

      for (let j = 0; j < columnSize; j++) {
        const isAvailable = this.properties[i][j] === EMPITY;
        if (isAvailable) availablePositions.push({ row: i, column: j });
      }
    }

    return availablePositions;
  }

  updateTarget({ target }) {
    const { row, column } = target.getCurrentPosition();
    this.properties[row][column] = TARGET;
  }

  updateSnake({ snake }) {
    this.clearSnakeFragments();

    const { body } = snake.properties;
    for (let i = 0; i < body.length; i++) {
      this.properties[body[i].row][body[i].column] = SNAKE_BODY;
    }
  }

  clearSnakeFragments() {
    const rowSize = this.properties.length;

    for (let i = 0; i < rowSize; i++) {
      const columnSize = this.properties[i].length;

      for (let j = 0; j < columnSize; j++) {
        const isSnakeFragment = this.properties[i][j] === SNAKE_BODY;
        if (isSnakeFragment) this.properties[i][j] = EMPITY;
      }
    }
  }
}

module.exports = Board;
