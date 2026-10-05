# Product Context — voice-timer

## Problem it solves

Timers are usually operated by tapping. That fails when your hands are wet, busy,
or you are doing something that needs both hands — cooking, gym work, crafts,
lab work. The user wants to start, pause, and skip a timer by speaking.

## Why it exists

The app is a personal timer that the user controls by voice. The distinguishing
feature is not that it has a timer, but that the timer is **hands-free**.

## Problems it solves

- Operating a timer with dirty or busy hands.
- Having to look at the screen to confirm the app heard you — solved by the
  recognized-command banner that fades in and out.
- Losing the timer when the app is backgrounded or the screen sleeps — solved by
  background actions and an ongoing notification.

## How it should work

- Speak a command; it executes immediately.
- The recognized command appears in a banner, holds for 5 seconds, then fades.
  A new command within that window resets the window.
- Commands work with the screen off. A sleeping-state notice on the Timers
  screen lists the commands that still work while asleep (added in `1e8aa4b`).

## User experience goals

- **Zero-friction start.** Voice is the primary interface, not an add-on.
- **No network dependency.** Recognition is local (Vosk), so it works anywhere.
- **Trustworthy feedback.** If the app did not visibly confirm, the user assumes
  it did not hear.
- **Readable at arm's length**, including at large font scales — this is why all
  text goes through `ui/AppText`, which adjusts `includeFontPadding`.
