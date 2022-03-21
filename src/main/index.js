const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const { KeyboardInput } = require('../input');
const { TraditionalBackgroundFactory } = require('../factories/backgroud-factory');
const { TargetFactory, SnakeFactory } = require('../factories/components-factory');

const session = {
  emitter: myEmitter,
  target: {},
  board: [],
  snake: {},
  status: 0,
  score: 0,
};

const backgroud = new TraditionalBackgroundFactory({ session });
backgroud.makeBackground({ row: 10, column: 10 });

const target = new TargetFactory({ session });
target.makeTarget();

const snake = new SnakeFactory({ session });
snake.makeSnake();

const run = () => {
  setTimeout(() => {
    snake.move();
    console.table(session.board);
    console.log(`SCORE: ${session.score}`);

    if (session.status === 0) run();
  }, 250);
};

const updateDirection = (key) => {
  session.snake.currentDirection = key;
};

const input = new KeyboardInput({
  eventHandler: updateDirection,
  stopCondition: (key) => key === 'q',
});

input.listen();
run();

myEmitter.on('score', () => {
  console.log('an event occurred!');
  target.makeTarget();
  session.score += 1;
});
