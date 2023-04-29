const { GetRandomArbitrary } = require('../utils/helpers')

class Target {
  constructor ({ startingPosition = { row: 5, column: 5 } } = {}) {
    this.position = startingPosition
  }

  getNextPosition ({ availablePositions }) {
    const randomIndex = GetRandomArbitrary.get({
      max: availablePositions.length - 1,
      min: 0
    })

    this.position = availablePositions[randomIndex]
    return this.position
  }
}

module.exports = Target
