# Progress — voice-timer

## What works

- Timer creation and control by voice, offline, via Vosk.
- Commands while backgrounded / screen off, with an ongoing notification.
- Bluetooth headset mic support, with permission handling.
- Screens: Timers, Create Timer, Contacts, History, Commands, Settings, About,
  Attribution, Terms, Logs.
- Spoken feedback (TTS) plus a visible recognized-command banner.
- Sleep-mode notice listing which commands still work while asleep.
- State persistence across force-close.

## Current status

The app is functional and maintained. Recent work has been polish and
tooling rather than new features — the last commits align styling with the
design tokens, fix a command-banner timing bug, and add Cline configuration.

## Known issues

| Issue | Severity |
| --- | --- |
| Logs screen unreachable while a timer is alerting | Low — likely intended |

The banner fade fix (`c5e47b5`) was verified by the user on-device: the banner
now stays pinned through a burst of commands and fades 5s after the last one.

## Not built / not verified

- No automated tests. `jest` is installed but there are no test scripts or test
  files, so verification is lint plus manual on-device testing.
- iOS is scaffolded under `ios/`, but the native modules and all recent work are
  Android-first. iOS behaviour is unverified.

## Evolution of decisions

- Commands were originally matched with `includes`; switched to whole-word
  matching (`hasPhrase`) to stop partial-word false positives.
- Logs screen was added and left commented out in the context menu while being
  built (`ae94ff1`), then exposed alongside a style pass (`233ff02`).
- Styling was consolidated onto design tokens in `constants/`, adopted
  incrementally file by file rather than in one sweeping change.
