const { stdin } = process;

class KeyboardInput {
  constructor({ stopCondition, eventHandler }) {
    this.stopCondition = stopCondition;
    this.eventHandler = eventHandler;
    this.stdin = stdin;
    this.config();
  }

  config() {
    this.stdin.setRawMode(true);
    this.stdin.resume();
    this.stdin.setEncoding('utf8');
  }

  listen() {
    this.stdin.on('data', (key) => {
      const shouldStop = this.stopCondition(key);
      if (shouldStop) process.exit();

      this.eventHandler(key);
    });
  }
}

module.exports = KeyboardInput;
