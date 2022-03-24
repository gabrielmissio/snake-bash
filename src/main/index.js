const { KeyboardInput } = require('../inputs');
const { DevelopmentOutput: output } = require('../outputs');
const { makeGameManager } = require('./game-manager-factory');

const gameManager = makeGameManager(); 
const { board, snake, target } = gameManager.properties;

board.updateSnake({ snake });
board.updateTarget({ target });

const gameOver = () => output.drawGameOver();
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

const input = new KeyboardInput({
  // eslint-disable-next-line no-return-assign
  eventHandler: (key) => snake.properties.currentDirection = parseInt(key, 10),
  stopCondition: (key) => key === 'q',
});

input.listen();
run();
