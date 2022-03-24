const { KeyboardInput } = require('../inputs');
const { DevelopmentOutput: output } = require('../outputs');
const { makeGameManager } = require('./game-manager-factory');

const gameManager = makeGameManager();
const { board, snake, target } = gameManager.properties;

board.updateSnake({ snake });
board.updateTarget({ target });

const gameOver = () => output.drawGameOver();
const nextFrame = () => {
  snake.move({
    isScore: () => gameManager.isScore(),
    isGameOver: () => gameManager.isGameOver(),
    gameOverHandler: () => gameManager.gameOverHandler(),
    scoreHandler: () => gameManager.scoreHandler()
  });

  board.updateSnake({ snake });
  output.drawBoard({ board: board.properties });
  output.drawScore({ score: gameManager.properties.score });
};

const run = () => {
  setTimeout(() => {
    nextFrame();
    const isGameOver = gameManager.properties.status !== 0;
    return isGameOver ? gameOver() : run();
  }, 250);
};

const quitTheGame = (key) => key === 'q';
const updateSnakeDirection = (key) => {
  snake.properties.currentDirection = parseInt(key, 10);
};

const input = new KeyboardInput({
  eventHandler: updateSnakeDirection,
  stopCondition: quitTheGame
});

input.listen();
run();
