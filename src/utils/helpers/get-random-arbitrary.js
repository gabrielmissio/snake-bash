class GetRandomArbitrary {
  /** Inclusive on both ends: every value in [min, max] can come out. */
  static get ({ min, max }) {
    if (max < min) throw new Error('INVALID RANGE')

    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

module.exports = GetRandomArbitrary
