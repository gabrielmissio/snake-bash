const { ComponentsEnum: { BRICK, EMPITY } } = require('../../utils/enums');

class TraditionalBackgroundFactory {

  static makeBackground({ row = 20, column = 20 } = {}) {
    const backgroud = [];
    for (let i = 0; i < row; i++) {
      backgroud.push([]);

      for (let j = 0; j < column; j++) {
        const isBoarderLeftAndUp = i === 0 || j === 0;
        const isBoarderRightAndDown = i === (row - 1) || j === (column - 1);

        const isBorder = isBoarderLeftAndUp || isBoarderRightAndDown;
        const componentToPush = isBorder ? BRICK : EMPITY;

        backgroud[i].push(componentToPush);
      }
    }

    return backgroud;
  }
}

module.exports = TraditionalBackgroundFactory;
