const { KeyboardInput } = require('../inputs');
const { MainOutput: output } = require('../outputs');
const { DirectionsEnum } = require('../utils/enums');
const { GAMEOVER } = require('../utils/enums/status-enum');
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

const intervalBetweenFramesInMilliseconds = 100;
const run = () => {
  setTimeout(() => {
    nextFrame();
    const isGameOver = gameManager.properties.status === GAMEOVER;
    return isGameOver ? gameOver() : run();
  }, intervalBetweenFramesInMilliseconds);
};

const quitGame = (key) => key === 'q';
const shouldReset = (key) => key === 'r';

const updateSnakeDirection = (key) => {
  if (shouldReset(key)) gameManager = makeGameManager();

  const allowedValues = Object.values(DirectionsEnum);
  const isValidDirection = allowedValues.includes(parseInt(key, 10));
  
  if (isValidDirection) snake.properties.currentDirection = parseInt(key, 10);  
};

const input = new KeyboardInput({
  eventHandler: updateSnakeDirection,
  stopCondition: quitGame
});

input.listen();
run(intervalBetweenFramesInMilliseconds);
