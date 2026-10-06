# Active Context — voice-timer

## Current focus

Commands-screen truthfulness, closed out. The screen is now the source of
truth for voice-command availability, and the handlers enforce what it
claims. Everything is committed; **14 commits are unpushed**.

## Recent changes

| Commit    | What                                                   |
| --------- | ------------------------------------------------------ |
| `5400206` | Enforce the "Make and answer calls with voice" switch  |
| `4d7392d` | Restore skip to the available sets; rewrite the legend |
| `f3816c1` | `Text` → `ui/AppText` across 21 files                  |
| `760a6df` | `.clinerules/timeouts.md`                              |
| `2500178` | `.clinerules/uncertainty.md`                           |

`git log` is the authoritative history. This table is a pointer, not a
substitute — it is deliberately short.

## Open items

- **14 commits are unpushed.** Pushing is the user's call, not the agent's.
- **`9060045`'s message still asserts skip was blocked**, which `4d7392d`
  reverses. The correction lives in `4d7392d`'s body rather than in rewritten
  history — squash or revert was offered and the user has not decided.
- **No automated tests**, so the call-switch fix (`5400206`) is verified by
  lint plus code tracing, not by running the app. On-device confirmation is
  still outstanding.

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
