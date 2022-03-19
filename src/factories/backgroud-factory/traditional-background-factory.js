class TraditionalBackgroundFactory {
  constructor({ session }) {
    this.session = session;
  }

  makeBackground({ row = 20, column = 20 } = {}) {
    this.session.board = [[]];

    for (let i = 0; i < row; i++) {
      this.session.board.push([]);

      for (let j = 0; j < column; j++) {
        const isBoarderLeftAndUp = i === 0 || j === 0;
        const isBoarderRightAndDown = i === (row - 1) || j === (column - 1);

        if (isBoarderLeftAndUp || isBoarderRightAndDown) {
          this.session.board[i].push('#');
        } else {
          this.session.board[i].push(' ');
        }
      }
    }
  }
}

module.exports = TraditionalBackgroundFactory;
