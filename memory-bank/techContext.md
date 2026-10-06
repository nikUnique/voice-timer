# Tech Context — voice-timer

## Stack

React Native 0.76.3 · React 18.3.1 · Expo SDK 52 (bare workflow — `android/`
and `ios/` are in the repo, not managed-only).

## Commands

Run from `package.json`. The Gradle ones stop the daemon before and after.

| Script | Purpose |
| --- | --- |
| `npm start` | Metro dev server |
| `npm run android` | Build + install debug on device |
| `npm run ios` | Build + run on iOS |
| `npm run bir` | Assemble release, install via adb, launch MainActivity |
| `npm run adbLog` | Filtered logcat (ReactNative, Vosk, AudioFocusModule…) |
| `npm run gradleClean` | `./gradlew clean` |
| `npm run stopGradle` | `./gradlew --stop` |

`npm run adbLog` is the primary debugging tool — it already filters to the tags
that matter, including `VoskDebug:D` and `AudioFocusModule`.

## Lint

```bash
npx eslint <files>
```

Config: `.eslintrc.json`, extending `eslint:recommended`, `plugin:react/recommended`,
`plugin:react-native/all`, `plugin:prettier/recommended`, `expo`.

`no-unused-vars` is **warn**, not error, so pre-existing warnings can remain.
Expect exit 0 with warnings printed.

There is **no prettier config file** and `prettier/prettier` is set to `off`, so
ESLint does not enforce formatting. Prettier itself is installed (via
`plugin:prettier/recommended`) and runs directly: `npx prettier --check <file>`
uses the default `printWidth` of 80. Use it on files you touched — pre-existing
files are not all Prettier-clean, so a repo-wide `--check` reports failures that
are not yours. Never run `prettier --write` on files outside the task.

No test setup is configured in practice. `jest` is a devDependency but there are
no test scripts or test files — verification is lint plus on-device manual
testing.

## Environment notes

- **The repo is on a VirtualBox shared folder (`vboxsf`).** It does not preserve
  the executable bit, so scripts committed from it land as mode `100644`. Invoke
  them with `bash <script>` rather than `./<script>`.
- **Shell output capture is unreliable in this environment.** The terminal
  wrapper often returns stale scrollback instead of the command's output, and
  reports exit code 1 even when the command succeeded. Redirect to a file and
  read it back:
  ```bash
  <cmd> > /tmp/out.txt 2>&1; echo "EXIT=$?" >> /tmp/out.txt; cat /tmp/out.txt
  ```
  Treat the captured exit code as the source of truth, not the tool result.
- **The VSCodium CLI cannot drive the running editor**, but `xdotool` can.
  `codium` on PATH is a symlink to `/usr/bin/snap` and fails with
  `cannot execute binary file`; `/usr/bin/snap run codium --version` works
  (1.105.17075) but `--command` always exits 1, because snap confinement blocks
  the IPC socket. Use `xdotool` instead — `DISPLAY` is already `:0.0`.
  Editor tabs close with `ctrl+shift+w`, terminals with `ctrl+alt+k`. Defocus
  first with `ctrl+grave` (backtick), then terminals, then tabs — and keep
  timeouts short (`timeout 5`). See
  `.cline/skills/wrap-up-session/SKILL.md`.

## Constraints

- **Never `git stash`** — see `.clinerules/git.md`.
- **Use the shortest timeout that covers the command** — see
  `.clinerules/timeouts.md`. Default `timeout 5`; whole-project lint takes ~10s
  and needs `timeout 15`. Nothing here needs 30, 60 or 90.
- **When unsure, stop and ask** — see `.clinerules/uncertainty.md`. Separate
  what is verified from what is assumed when reporting.
- Generated trees are enormous: `android/app/build` 4.2G, `android/app/.cxx`
  1.0G, `node_modules` 2.2G. They are in `.clineignore`; don't search them.
- Timezone is `America/Phoenix`, so all commits are `-0700` year-round (no DST).

## Key dependencies

| Package | Used for |
| --- | --- |
| `react-native-vosk` | offline speech recognition |
| `react-native-tts` | spoken feedback |
| `react-native-volume-manager`, `useControlledVolume` | volume keys for commands |
| `react-native-background-actions` | commands while backgrounded |
| `@notifee/react-native` | ongoing timer notifications |
| `react-native-audio-focus` | native module only — mic ownership, Bluetooth mic |
| `@shopify/flash-list` | timer list |
| `libphonenumber-js` | Contacts phone numbers |
| `mitt` | event bus (`utils/EventEmitter.js`) |
