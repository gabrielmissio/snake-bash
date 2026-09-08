# Snake Bash

The Snake Bash Game is a classic arcade-style game that you can play directly from your terminal.

```
  SNAKE BASH

  SCORE 3  |  BEST 7  |  FPS 10.0

  # # # # # # # # # # # # # # #
  #                           #
  #       * * *               #
  #                           #
  #                       $   #
  #                           #
  # # # # # # # # # # # # # # #

  arrows/4682 move  +/- speed  p pause
  r restart  q quit
```

## How to play

To start the game, run the following command in your terminal:

```bash
npx snake-bash
```

If you install it as a global dependency you can use the shortcut `snake-bash`.

### Control the snake

Use the `arrow keys` to move the snake, optionally:

* `4`: move left
* `6`: move right
* `8`: move up
* `2`: move down

### Interact with the game

* `+` / `-`: speed the snake up or slow it down
* `p` or `space`: pause
* `r`: restart the game
* `q` or `Ctrl+C`: quit the game

### Options

```bash
snake-bash --size 20        # a 20x20 board
snake-bash --size 15x40     # 15 rows, 40 columns
snake-bash --fps 15         # start faster
snake-bash --no-color       # plain output
snake-bash --help
```

Colours are also disabled automatically when the output is not a terminal, or
when `NO_COLOR` is set.

## How it renders

Terminals flicker when a game blanks the screen and repaints it from scratch on
every frame. Snake Bash never blanks the screen: it keeps the previous frame in
memory, works out which lines actually changed, and rewrites only those, in
place, as a single write to stdout. A frame where nothing moved costs no output
at all.

The game also runs on the alternate screen buffer, so quitting gives you your
prompt and scrollback back exactly as you left them, and the terminal is
restored on every exit path, including `Ctrl+C` and unexpected errors.

## How to customize

To customize this game, you can clone the repository and install the
dependencies (linters and nothing else -- the game itself has zero runtime
dependencies):

```bash
git clone https://github.com/gabrielmissio/snake-bash.git
cd snake-bash
npm install
```

You can then make changes to the code and run the game using:

```bash
npm start
```

Run the checks with:

```bash
npm test     # unit tests, via the built-in node:test runner
npm run lint
```

Set `OUTPUT_MODE=DevelopmentOutput` to get plain, escape-free frames, which is
handy when piping the output somewhere or debugging the board state:

```bash
OUTPUT_MODE=DevelopmentOutput npm start
```

### Layout

```
src/
  backgrounds/   the walls the board is built from
  components/    board, snake and target
  inputs/        raw keyboard reading and key decoding
  outputs/       frame composition, diffing renderer, terminal modes
  main/          game manager, loop, CLI entry point
  utils/         enums and small helpers
```

Requires Node.js 18 or newer.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
