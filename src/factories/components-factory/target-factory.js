const { GetRandomArbitrary } = require('../../utils/helpers');

class TargetFactory {
  constructor({ startingPosition } = {}) {
    const row = startingPosition && startingPosition.row || 5;
    const column = startingPosition && startingPosition.column || 5;

    this.properties = { row, column };
  }

  getCurrentPosition() {
    return this.properties;
  }

  getNextPosition({ availablePositions  }) {
    const max = availablePositions.length - 1;
    const randomIndex = GetRandomArbitrary.get({ max, min: 0 });

    this.properties = availablePositions[randomIndex];
    return this.properties;
  }
}

module.exports = TargetFactory;
