const { DirectionsEnum } = require('../../utils/enums');

class SnakeFactory {
  constructor({ startingPosition, startingDirection  } = {}) {
    const row = startingPosition.row || 2;
    const column = startingPosition.column || 2;
    const currentDirection = startingDirection || DirectionsEnum.RIGTH;
    
    this.snake = {
      currentDirection,
      body: [{ row, column }]
    };
  }

  move({ isScore, scoreHandler, isGameOver, gameOverHandler }) {
    const { body } = this.snake;
    body.unshift(this.getNextPosition());

    if (isGameOver({ snake: this })) return gameOverHandler();
    if (isScore({ snake: this })) return scoreHandler();
    return body.pop();
  }

  getNextPosition() {
    const { currentDirection } = this.snake;

    const invalidDirection = !(currentDirection in DirectionsEnum);
    if (invalidDirection) throw new Error('INVALID DIRECTION');

    const currentHeadPosition = this.getHeadPosition();
    const options = {
      [DirectionsEnum.RIGTH]: { row: currentHeadPosition.row, column: currentHeadPosition.column + 1 },
      [DirectionsEnum.LEFT]: { row: currentHeadPosition.row, column: currentHeadPosition.column - 1 },
      [DirectionsEnum.DOWN]: { row: currentHeadPosition.row + 1, column: currentHeadPosition.column },
      [DirectionsEnum.UP]: { row: currentHeadPosition.row - 1, column: currentHeadPosition.column },
    };

    return options[currentDirection];
  }

  getHeadPosition() {
    const { body } = this.snake;
    const headPosition = body[0];

    return headPosition;
  }
}

module.exports = SnakeFactory;
