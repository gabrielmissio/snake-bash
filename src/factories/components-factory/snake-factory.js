const { DirectionsEnum } = require('../../utils/enums');

class SnakeFactory {
  constructor({ startingPosition, startingDirection  } = {}) {
    const row = startingPosition && startingPosition.row || 2;
    const column = startingPosition && startingPosition.column || 2;
    const currentDirection = startingDirection || DirectionsEnum.RIGTH;
    
    this.properties = {
      currentDirection,
      body: [{ row, column }]
    };
  }

  move({ isScore, scoreHandler, isGameOver, gameOverHandler }) {
    const { body } = this.properties;
    body.unshift(this.getNextPosition());

    if (isGameOver({ snake: this })) return gameOverHandler();
    if (isScore({ snake: this })) return scoreHandler();
    return body.pop();
  }

  getNextPosition() {
    const { currentDirection } = this.properties;

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
    return this.properties.body[0];
  }
}

module.exports = SnakeFactory;
