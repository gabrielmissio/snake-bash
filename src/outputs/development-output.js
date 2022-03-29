class DevelopmentOutput {
  static drawBoard({ board }) {
    console.table(board);
  }

  static drawScore({ score }) {
    console.log(score);
  }

  static drawGameOver() {
    console.log('GAME OVER');
  }

  static clear() {
    console.clear();
  }
}

module.exports = DevelopmentOutput;
