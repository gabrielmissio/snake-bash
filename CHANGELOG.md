# Changelog

All notable changes to this project are documented here.

## [2.0.0] - 2026-09-08

### Fixed

- **The game no longer freezes for seconds at a time.** Frames were scheduled
  against `Date.now()`, the wall clock, which steps whenever the machine
  corrects it -- NTP, resuming a VM, or WSL2 resyncing after the host sleeps.
  A backwards step of N left the next frame's deadline N in the future, so the
  game stalled for exactly that long and then carried on as if nothing had
  happened. On the WSL2 box this was found on, the clock steps back about 470ms
  every 31 seconds. Frames are now scheduled on a monotonic clock, and no frame
  is ever allowed to wait longer than one interval.
- **The terminal no longer blinks.** Every frame used to call `console.clear()`,
  blanking the screen, and then repaint it with 246 separate writes to stdout --
  one per cell. The screen was empty for part of every frame, which is what the
  eye read as flicker. Frames are now diffed against the previous one and only
  the changed lines are rewritten in place, as a single write. A frame where
  nothing moved costs no output at all.
- **The game loop no longer drifts.** Frames were rescheduled *after* the frame's
  work was done, so each one ran late by however long that work took and the
  displayed FPS was never the real one. The loop now schedules against an
  absolute deadline.
- **Quick turns are no longer swallowed.** Only the last key pressed between two
  frames used to count. Up to two turns are now queued, while still refusing a
  180-degree reversal.
- **`Ctrl+C` works.** In raw mode it arrives as data rather than as `SIGINT`, and
  it was not handled, so the game could only be left with `q`.
- **The terminal is always restored**, on every exit path including crashes.
  Previously a quit or an error could leave the cursor hidden and the terminal
  in raw mode.
- **Turning into your own tail is no longer fatal.** Collision was tested against
  the drawn board, which still showed the tail cell the snake was about to leave.
- **The last free cell can now hold a target.** The random helper never returned
  its upper bound.
- **Speed no longer reaches an interval of 0 ms** (an FPS readout of `Infinity`)
  when `+` is held down.
- **Fast keystrokes are read correctly.** A single input event can carry several
  keys, and an arrow key is three bytes; without splitting them an arrow could
  leak through as a literal letter.
- **Filling the board wins** instead of throwing on an empty position range.
- **Game over leaves the wall intact** instead of drawing the snake over it.
- **Changing speed is felt immediately.** `+` and `-` left the frame already
  queued at the old pace, so a speed change could be ignored for up to half a
  second.
- **The snake no longer moves behind the "terminal too small" notice**, where it
  would run into a wall the player could not see.

### Added

- Alternate screen buffer, so quitting restores the prompt and scrollback.
- Colours, honouring `NO_COLOR` and non-TTY output.
- Pause with `p` or `space`, and a best-score counter.
- CLI options: `--size`, `--fps`, `--no-color`, `--help`, `--version`.
- A warning when the window is too small, and a repaint on resize.
- A test suite on the built-in `node:test` runner, and CI on Node 18, 20 and 22.

### Changed

- **Breaking:** `MainOutput` and `DevelopmentOutput` now build a frame and hand
  it to a `Screen` instead of writing to stdout themselves. The static
  `drawBoard` / `drawGameplayInfo` / `drawInstructions` / `drawGameOver` /
  `clear` methods are gone, replaced by an instance `render(state)` method.
  This only affects code that imported those modules directly.
- Requires Node.js 18 or newer.
- The game still has zero runtime dependencies.

## [1.1.1]

- Snake speed adjustment through the `+` and `-` keys.
- Arrow key support.
