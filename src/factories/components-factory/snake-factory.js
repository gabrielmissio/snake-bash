const {
  ComponentsEnum: {
    SNAKE_HEAD, SNAKE_BODY, TARGET, BRICK, EMPITY,
  },
  DirectionsEnum: {
    RIGTH, LEFT, DOWN, UP,
  },
} = require('../../utils/enums');

class SnakeFactory {
  constructor({ session }) {
    this.session = session;
  }

  makeSnake() {
    this.session.snake = {
      nextHeadPosition: {},
      currentHeadPosition: { row: 2, column: 2 },
      body: [{ row: 2, column: 1 }],
      currentDirection: RIGTH,
    };

    this.updateSnake();
  }

  move() {
    const { board, snake } = this.session;
    const { body, currentHeadPosition, nextHeadPosition } = snake;

    const { row, column } = this.getNextPosition();
    nextHeadPosition.row = row;
    nextHeadPosition.column = column;

    if (this.isGameOver()) throw new Error('GAME OVER');
    if (this.isScore()) {
      // throw event
    } else {
      board[body[0].row][body[0].column] = EMPITY;
      body.reverse().pop();
    }

    body.push({ ...currentHeadPosition });
    currentHeadPosition.row = row;
    currentHeadPosition.column = column;

    this.updateSnake();
  }

  getNextPosition() {
    const { snake: { currentDirection, currentHeadPosition } } = this.session;

    const options = {
      [RIGTH]: () => ({ row: currentHeadPosition.row, column: currentHeadPosition.column + 1 }),
      [LEFT]: () => ({ row: currentHeadPosition.row, column: currentHeadPosition.column - 1 }),
      [DOWN]: () => ({ row: currentHeadPosition.row + 1, column: currentHeadPosition.column }),
      [UP]: () => ({ row: currentHeadPosition.row - 1, column: currentHeadPosition.column }),
    };

    return options[currentDirection]();
  }

  isGameOver() {
    const { board, snake } = this.session;
    const { nextHeadPosition: { row, column } } = snake;

    const hitsBrick = board[row][column] === BRICK;
    const hitsSnakeBody = board[row][column] === SNAKE_BODY;

    return hitsBrick || hitsSnakeBody;
  }

  isScore() {
    const { board, snake } = this.session;
    const { nextHeadPosition: { row, column } } = snake;

    return board[row][column] === TARGET;
  }

  updateSnake() {
    const { board, snake } = this.session;
    const { body, currentHeadPosition: { row, column } } = snake;

    this.session.board[row][column] = SNAKE_HEAD;
    for (let i = 0; i < body.length; i++) {
      board[body[i].row][body[i].column] = SNAKE_BODY;
    }
  }
}

module.exports = SnakeFactory;
