const { GetRandomArbitrary } = require('../../utils/helpers');

class TargetFactory {
  constructor({ startingPosition }) {
    const row = startingPosition.row || 5;
    const column = startingPosition.column || 5;

    this.target = { row, column };
  }

  getCurrentPosition() {
    return this.target;
  }

  getNextPosition({ availablePositions  }) {
    const max = availablePositions.length - 1;
    const randomIndex = GetRandomArbitrary.get({ max, min: 0 });

    this.target = availablePositions[randomIndex];
    return this.target;
  }
}

module.exports = TargetFactory;
