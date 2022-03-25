const {
  CostumesEnum: { SNAKE, TARGET, EMPITY }
} = require('../utils/enums');

class Board {
  constructor({ background, boardSize }) {
    this.row = (boardSize && boardSize.row) || 15;
    this.column = (boardSize && boardSize.column) || 15;
    this.background = background;

    this.setToInitialState();
  }

  setToInitialState() {
    this.properties = this.background.makeBackground({
      row: this.row,
      column: this.column
    });
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
      this.properties[body[i].row][body[i].column] = SNAKE;
    }
  }

  clearSnakeFragments() {
    const rowSize = this.properties.length;

    for (let i = 0; i < rowSize; i++) {
      const columnSize = this.properties[i].length;

      for (let j = 0; j < columnSize; j++) {
        const isSnakeFragment = this.properties[i][j] === SNAKE;
        if (isSnakeFragment) this.properties[i][j] = EMPITY;
      }
    }
  }
}

module.exports = Board;
