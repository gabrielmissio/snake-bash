const { GetRandomArbitrary } = require('../../utils/helpers');
const {
  ComponentsEnum: {
    EMPITY, TARGET,
  },
} = require('../../utils/enums');

class TargetFactory {
  constructor({ session }) {
    this.session = session;
  }

  makeTarget() {
    while (!this.targetPositioned());
  }

  targetPositioned() {
    const { board } = this.session;
    const rowSize = board.length - 1;
    const randomRow = GetRandomArbitrary.get({ min: 1, max: rowSize });

    const columnSize = board[randomRow].length - 1;
    const randomColumn = GetRandomArbitrary.get({ min: 1, max: columnSize });

    const isAvailable = board[randomRow][randomColumn] === EMPITY;
    if (!isAvailable) return false;

    board[randomRow][randomColumn] = TARGET;
    this.session.target.position = { row: randomRow, column: randomColumn };
    return true;
  }
}

module.exports = TargetFactory;
