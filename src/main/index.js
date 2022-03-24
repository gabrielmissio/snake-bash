const { TraditionalBackgroundFactory } = require('../factories/backgroud-factory');
const { BoardFactory, SnakeFactory, TargetFactory } = require('../factories/components-factory');
const { KeyboardInput } = require('../inputs');
const { DevelopmentOutput: output } = require('../outputs');
const GameManager = require('./game-manager');

const board = new BoardFactory({ backgroundFactory: TraditionalBackgroundFactory });
const snake = new SnakeFactory();
const target = new TargetFactory();

board.updateSnake({ snake });
board.updateTarget({ target });

const gameManager = new GameManager({ board, snake, target });
const input = new KeyboardInput({
  // eslint-disable-next-line no-return-assign
  eventHandler: (key) => snake.properties.currentDirection = parseInt(key, 10),
  stopCondition: (key) => key === 'q',
});

const gameOver = () => {
  output.drawGameOver();
}

const run = () => {
  setTimeout(() => {
    snake.move({
      isScore: () => gameManager.isScore(),
      isGameOver: () => gameManager.isGameOver(),
      gameOverHandler: () => gameManager.gameOverHandler(),
      scoreHandler: () =>  gameManager.scoreHandler(),
    });

    board.updateSnake({ snake });
    output.drawBoard({ board: board.properties });
    output.drawScore({ score: gameManager.properties.score });

    const isGameOver = gameManager.properties.status !== 0;
    return isGameOver ? gameOver() : run();
  }, 250);
};

input.listen();
run();
