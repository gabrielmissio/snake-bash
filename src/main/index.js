const { KeyboardInput } = require('../inputs');
const { DevelopmentOutput: output } = require('../outputs');
const { makeGameManager } = require('./game-manager-factory');
const { GAMEOVER } = require('../utils/enums/status-enum');

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

const intervalBetweenFramesInMilliseconds = 200;
const run = () => {
  setTimeout(() => {
    nextFrame();
    const isGameOver = gameManager.properties.status === GAMEOVER;
    return isGameOver ? gameOver() : run();
  }, intervalBetweenFramesInMilliseconds);
};

const quitGame = (key) => key === 'q';
const updateSnakeDirection = (key) => {
  snake.properties.currentDirection = parseInt(key, 10);
};

const input = new KeyboardInput({
  eventHandler: updateSnakeDirection,
  stopCondition: quitGame
});

input.listen();
run(intervalBetweenFramesInMilliseconds);
