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

1. **The Logs context-menu item is unreachable while a timer is alerting.** The
   handler short-circuits on a non-empty `alertingTimerNames`. Reads as
   intentional, but it is a user-facing behaviour change riding along with a
   cosmetic commit.

## Known cosmetic issues

None outstanding — both were cleaned up. `ContextMenu.js` had a redundant JSX
wrapper around the Logs `Pressable` (unlike its bare siblings), and
`useCommandsControl.js` destructured `prevRecognizedCommandRef` without using
it.

Note on the latter: that ref is **live elsewhere** — `useCallConfirmationFlow`
and `useGeneralVoiceCommands` both rely on it to hold the pending command across
a spoken yes/no confirmation. Only the `useCommandsControl.js` destructure was
dead, so removing it there is safe. Do not remove the context export.

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
