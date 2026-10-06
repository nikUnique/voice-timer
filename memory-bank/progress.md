# Progress — voice-timer

## What works

- Timer creation and control by voice, offline, via Vosk.
- Commands while backgrounded / screen off, with an ongoing notification.
- Bluetooth headset mic support, with permission handling.
- Screens: Timers, Create Timer, Contacts, History, Commands, Settings, About,
  Attribution, Terms, Logs.
- Spoken feedback (TTS) plus a visible recognized-command banner.
- Sleep-mode notice listing which commands still work while asleep.
- Commands screen explains why each command is unavailable — a setting you
  chose or the current app state — with a legend and per-card notes.
- State persistence across force-close.

## Current status

The app is functional and maintained. Recent work has been a truthfulness pass
on the Commands screen rather than new features: it is now the source of truth
for voice-command availability, its legend and availability sets match the real
gating, `Text` runs through `ui/AppText` everywhere, and the voice-calling
switch is actually enforced. Fourteen commits are unpushed.

## Known issues

None outstanding.

The Logs screen is intentionally unreachable from the timers context menu while a
timer is alerting — the user must stop the alarm first. That is a safety
behaviour, not a defect.

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
- The media/sleep availability matrix went back and forth three times:
  `59d385c` restored skip, `9060045` removed it again after reading only one
  hook, and `4d7392d` restored it once both hooks were traced. The lesson
  recorded in `.clinerules/uncertainty.md` — the screen must mirror the
  runtime, and the runtime is two hooks, not one.
- The voice-calling switch was decorative until `5400206`: the Commands screen
  claimed call and phone were off while both handlers ignored the setting.
  Enforcing a setting always means finding every path to the action, not just
  the one the bug report names.
