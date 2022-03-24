const {
  CostumesEnum: { BRICK, SNAKE, TARGET },
  StatusEnum: { GAMEOVER, RUNNING }
} = require('../utils/enums');

class GameManager {
  constructor({ board, snake, target } = {}) {
    this.properties = {
      board,
      snake,
      target,
      status: RUNNING,
      score: 0
    };
  }

  isScore() {
    const { snake, board } = this.properties;
    const { row, column } = snake.getHeadPosition();

    return board.properties[row][column] === TARGET;
  }

  isGameOver() {
    const { snake, board } = this.properties;
    const { row, column } = snake.getHeadPosition();

    const hitsBrick = board.properties[row][column] === BRICK;
    const hitsSnakeBody = board.properties[row][column] === SNAKE;

    return hitsBrick || hitsSnakeBody;
  }

  gameOverHandler() {
    this.properties.status = GAMEOVER;
  }

  scoreHandler() {
    const { board, target } = this.properties;
    const availablePositions = board.getAvailablePositions();

    target.getNextPosition({ availablePositions });
    board.updateTarget({ target });

    this.properties.score += 1;
  }
}

module.exports = GameManager;
