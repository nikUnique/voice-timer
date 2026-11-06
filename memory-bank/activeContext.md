# Active Context — voice-timer

## Current focus

TimerTick native module (commit `aac9652`) is now wired on the JS side: the
self-scheduling `setTimeout` chain and drift math in `useTimeUpdate.js` have
been replaced with a listener on the native `"TimerTick"` event, with
`startTicking`/`stopTicking` managed per timer lifecycle via reference counting.
Alarm, notification, and history logic are untouched. Six commits are unpushed.

## Recent changes

| Commit    | What                                                   |
| --------- | ------------------------------------------------------ |
| `6cbfc58` | Add AGENTS.md                                          |
| `aac9652` | Add native TimerTick module and register it             |
| `0e3346f` | Scroll to current timer when app becomes active         |
| `da3941b` | chore(scripts): add installApk npm script              |
| `15e2a3e` | chore(android): target Android 16 (API 36)             |
| `54e8b9b` | Route TTS completion through useTTS global listeners   |

`git log` is the authoritative history. This table is a pointer, not a
substitute — it is deliberately short.

## Open items

- **Six commits are unpushed.** Pushing is the user's call, not the agent's.
- **On-device verification pending** for TimerTick background advancement and
  wake-lock lifecycle (lock phone, watch `npm run adbLog` for `New time comes-<name>` logs).
- **No automated tests**, so verification is lint plus on-device manual testing.

## Deliberate behaviours (do not "fix" these)

- **The Logs entry in the timers context menu is blocked while a timer is
  alerting.** `ContextMenu.js` short-circuits navigation on a non-empty
  `alertingTimerNames`. This is **intended**: the user must stop the alarm first
  before leaving the timers screen. Confirmed by the user — it is a safety
  behaviour, not an oversight, and should not be logged as an issue.
- **Redundant JSX wrapper in `ContextMenu.js`** and an **unused
  `prevRecognizedCommandRef` destructure in `useCommandsControl.js`** were both
  cleaned up.

## Known cosmetic issues

None outstanding — both were cleaned up. `ContextMenu.js` had a redundant JSX
wrapper around the Logs `Pressable` (unlike its bare siblings), and
`useCommandsControl.js` destructured `prevRecognizedCommandRef` without using
it.

Note on the latter: that ref is **live elsewhere** — `useCallConfirmationFlow`
and `useGeneralVoiceCommands` both rely on it to hold the pending command across
a spoken yes/no confirmation. Only the `useCommandsControl.js` destructure was
dead, so removing it there is safe. Do not remove the context export.

Its seeding behaviour matters: when `startConfirmation` returns `false`,
`useGeneralVoiceCommands` still assigns the current utterance to this ref.
A "call X" spoken while calling is switched off therefore leaves a call phrase
pending, and a later "yes" would reach `handleYes` with it. That is why
`5400206` gates `handleYes` as well as `startConfirmation` — gating only the
prompt would not have prevented the dial.

## Tried and rejected

These cost time; do not retry them.

- **Notification-tap persistence machinery (Oct 2026).** A tap-scroll miss on
  cold start was "fixed" with AsyncStorage tap persistence, a top-level
  `onBackgroundEvent` in `index.js`, timer-name resolution and a
  `getInitialNotification` fallback. It broke timer restart on reload and was
  fully reverted. The real cause was timing: `isReady` flips on the first
  restored timer while the FlatList still has `listHeight === 0`, so a single
  `scrollToIndex` throws into the swallowed helper. The working fix was a 2s
  `setTimeout` before scrolling in `TimerList.js` (plus timeout cleanup).
  Simplest timing hypothesis first; never touch the restart path for a scroll
  bug.
- **Repo-wide `prettier --write` during the `Text` → `AppText` swap.** It
  reformatted 18 unrelated files (quote style, JSX attribute wrapping) to
  deliver a two-line-per-file import change. Reverted with `git restore` and
  redone without Prettier — `prettier/prettier` is `off` in `.eslintrc.json`
  anyway. Editing sessions must not reformat files they were not asked to
  change.
- **The first swap script's `[\s\S]*?` regex.** It crossed statement
  boundaries, matching from the first `import` in the file and rebuilding
  multi-line import chains into one line. It only looked correct by
  coincidence in a dry run. Fixed to `[^;]*?`, so a match cannot span a `;`.
  Dry-run first, always.
- **`timeout 30` as a blanket ceiling.** Chosen without measuring; the helper
  scripts it guarded take 0.14s. The user objected, which produced
  `.clinerules/timeouts.md`. Measure, do not pad.

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
- **`check-styles.sh` cannot see a single-line `react-native` import.** Its
  `Text` pattern only matches a bare line or a brace list, so an import line
  beginning with `import` slips past it entirely. The green run during the
  AppText swap was weaker than it looked, and the real gate is a parser-based
  scan. **The user chose to leave the script alone** — do not change it.
- **The AppText sweep and the legend rewrite were staged apart** even though
  both touched `ListHeader.js`, by hand-splitting the patch and running
  `git apply --cached` on the import hunk only. Keeps a mechanical sweep
  reviewable as one diff without entangling it in content work.
- **The `answer call` gate went in beyond the reported scope** (the report
  named only phone and call). Justified by the switch label "Make and answer
  calls with voice" — leaving it ungated would have made that switch half
  work. Flagged to the user, who accepted it.

## Learnings

- In this environment, shell output capture is unreliable — redirect to a file
  and read it back, or trust an exit code you captured yourself.
- The repo lives on a `vboxsf` share, which drops the executable bit. Scripts
  must be invoked with `bash <script>`.
- Multi-part `-m` arguments with embedded double quotes can be mangled between
  the tool call and the shell (exit 127, `No such file or directory` on a
  fragment of the message). Write the message to a file and use
  `git commit -F <file>` instead.
- A runner may report "completion could not be observed" for a command that
  did finish. Check the real exit state and output rather than raising a
  timeout — see `.clinerules/timeouts.md`.
