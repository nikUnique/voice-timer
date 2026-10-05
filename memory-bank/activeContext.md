# Active Context — voice-timer

## Current focus

Cline project tooling has just been set up (rules, a skill, `.clineignore`, and
this memory bank). No application work is in flight.

## Recent changes

| Commit | What |
| --- | --- |
| `c5bcdca` | Cline rules, `add-screen` skill, `.clineignore` |
| `c5e47b5` | Fix: banner timeout reset on repeated commands |
| `233ff02` | Align Logs screen to project tokens; expose Logs in context menu |
| `1e8aa4b` | Sleeping-state notice on the Timers screen |
| `ae94ff1` | Added Logs screen |

`git log` is the authoritative history. This table is a pointer, not a
substitute.

## Open items

Carried forward, both deliberate rather than forgotten:

1. **The banner fade fix (`c5e47b5`) has not been verified on-device.** Static
   analysis shows competing `Animated.sequence`s no longer overlap, but the
   behaviour — banner stays pinned through a burst of commands, then fades 5s
   after the *last* one — needs a real run. Check with `npm run android`, then
   `npm run adbLog`.
2. **The Logs context-menu item is unreachable while a timer is alerting.** The
   handler short-circuits on a non-empty `alertingTimerNames`. Reads as
   intentional, but it is a user-facing behaviour change riding along with a
   cosmetic commit.

## Known cosmetic issues

- Redundant `{ }` wrapper around the Logs `Pressable` in
  `components/TimersScreen/ContextMenu.js`, unlike its bare `Pressable`
  siblings. Renders identically; left as-is on purpose.
- `prevRecognizedCommandRef` is destructured but unused in
  `hooks/TimersScreen/voiceControl/useCommandsControl.js` (lint warning,
  pre-existing). Unrelated to any current work.

## Decisions worth remembering

- **The Logs menu entry was committed together with the style alignment** rather
  than separately, by explicit choice. If it ever needs reverting, those two
  concerns are entangled in `233ff02`.
- **`.clineignore` keeps `android/app/src/` and `ios/` readable** even though
  they are native. The app's core value (Vosk, audio focus, Bluetooth mic) lives
  there, so hiding them would cripple the most common kinds of work.
- **`memory-bank/` is deliberately not a restatement of the conventions.**
  `.clinerules/git.md` and the `add-screen` skill are the single sources for
  those; this bank links to them. Duplicated conventions go stale.

## Learnings

- In this environment, shell output capture is unreliable — redirect to a file
  and read it back, or trust an exit code you captured yourself.
- The repo lives on a `vboxsf` share, which drops the executable bit. Scripts
  must be invoked with `bash <script>`.
