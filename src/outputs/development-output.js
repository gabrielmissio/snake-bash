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
}

module.exports = DevelopmentOutput;
