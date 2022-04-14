class GetRandomArbitrary {
  static get({ min, max }) {
    return parseInt(Math.random() * (max - min) + min, 10);
  }
}

module.exports = GetRandomArbitrary;
