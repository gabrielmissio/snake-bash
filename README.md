# Snake Bash

The Snake Bash Game is a classic arcade-style game that you can play directly from your terminal.

## Installation

To install the game, use npm:

```bash
npm i -g snake-bash
```

## How to play

To start the game, simply run the following command in your terminal:

```bash
npx snake-bash
```

The objective of the game is to eat as many apples as possible without colliding with the walls or the snake's own tail. Each apple that the snake eats will increase the score by 1 points. The game ends when the snake collides with a wall or its own tail.

### Use the following keys to control the snake:

* `4`: move left
* `6`: move right
* `8`: move up
* `2`: move down

### Use the following keys to interact with the game:

* `q`: quit the game
* `r`: restart the game

## How to customize

To customize this game, you can clone the repository and install the dependencies (only linters):

```bash
git clone https://github.com/gabrielmissio/snake-bash.git
cd snake-bash
npm install
```

You can then make changes to the code and run the game using:

```bash
npm start
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
