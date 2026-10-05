---
name: wrap-up-session
description: Clean up after finishing a task — stop background processes, remove temp files, close terminal and editor tabs opened during the work, and confirm the tree is in a known state. Use when a task is complete, when asked to "clean up", "tidy up", "wrap up", "finish up", or when handing work back before a break or context reset. Also use before starting a Memory Bank update, since a clean tree makes the update accurate.
---

# Wrap up a session

Close out work so nothing is left running or half-open. Run this **before**
reporting a task done, not only when explicitly asked.

## What can and cannot be closed

Be precise about this, and say plainly when something is out of reach.

**Can be closed from here:**
- Background processes started during the task (`npx`, `expo start`, Metro,
  `eslint` watchers, `jest --watch`, dev servers, logcat streams).
- Shell sessions left running in background.
- Temporary files written during the task (`/tmp/*.txt` and similar scratch
  output).
- Editor **tabs and terminal panels**, via `xdotool` keystrokes (see step 3).

**Cannot be closed from here:**
- Terminal panels or editor windows the *user* opened by hand.
- Anything outside this machine (a build running on a remote host, a browser).

When something cannot be closed, say so in the summary rather than implying it
was handled. Do not claim a cleanup that did not happen.

**Do not take screenshots.** Not to verify, not to confirm, not to check whether a
keystroke landed. See step 3. The user will ask if they want one.

## Steps

### 1. Stop background processes

Check what is actually running, then stop only what this task started:

```bash
pgrep -af 'gradle|java|metro|expo|node.*eslint|jest|adb|logcat'
```

Gradle in this project is stopped with `npm run stopGradle`. Never leave a
Gradle daemon or Metro bundler holding a build lock — it will make the next
`npm run android` slow or fail oddly.

**Do not kill the editor's own processes.** The VS Code/VSCodium extension
hosts, language servers (`tsserver`, `eslintServer`, `stylelint`), and
`NodeService` utilities are the user's environment, not ours. Killing them
closes their tooling. Match narrowly and prefer `npm run stopGradle` over a
blanket `pkill java`.

### 2. Remove temp files

Scratch output written during the task, e.g. `/tmp/lint.txt`, `/tmp/state.txt`,
`/tmp/verify.txt`. Keep anything the user asked to keep.

### 3. Close tabs

`xdotool` works here and is the way to do this:

```bash
# Focus the editor first, then send the shortcut.
WID=$(xdotool search --name 'VSCodium' | head -1)
xdotool windowactivate --sync "$WID"
xdotool key --window "$WID" --clearmodifiers ctrl+shift+w    # close all tabs
```

Verify it landed — the window title loses its leading tab name:

```bash
xdotool getwindowfocus getwindowname
```

`DISPLAY` is already `:0.0` in this environment, so no export is needed.
`--clearmodifiers` avoids the shortcut being swallowed by a stuck modifier, and
`--window` targets the window explicitly rather than relying on current focus.

**Order matters: defocus → close terminals → close editor tabs.**

Defocus first with `Ctrl+`` (View: Toggle Terminal). Toggling the panel moves
focus into the editor, which is what makes `ctrl+alt+k` land at all — while the
terminal itself holds focus it is silently ignored. Do **not** defocus with
`ctrl+shift+e`: that switches the sidebar to the Explorer, and the Cline tab
should stay active.

```bash
WID=$(xdotool search --name 'VSCodium' | head -1)
xdotool windowactivate --sync "$WID"

xdotool key --window "$WID" --clearmodifiers ctrl+grave    # defocus terminal panel
sleep 1
xdotool key --window "$WID" --clearmodifiers ctrl+alt+k    # kill all terminals
sleep 1
xdotool key --window "$WID" --clearmodifiers ctrl+shift+w   # close all editor tabs
```

`xdotool` names the backtick key **`grave`**, not `` ` `` or `` ` ``.

Closing terminals also kills the shell running the command, so run the whole
sequence detached if the caller needs to survive it:

```bash
setsid nohup bash -c 'sleep 2; WID=$(xdotool search --name "VSCodium" | head -1); \
  xdotool windowactivate --sync "$WID"; \
  xdotool key --window "$WID" --clearmodifiers ctrl+grave; sleep 1; \
  xdotool key --window "$WID" --clearmodifiers ctrl+alt+k; sleep 1; \
  xdotool key --window "$WID" --clearmodifiers ctrl+shift+w' \
  > /tmp/closed.txt 2>&1 &
```

Verify afterwards from a fresh shell — the window title should have no tab name
prefix. Success on the terminal step looks like the tool reporting "Terminal
closed while the command was running"; that is expected, not a failure.

**Keep timeouts short.** Use `timeout 5` or so on `xdotool` calls and short
`sleep` gaps. Long timeouts stall the whole task over a keystroke, and this
window responds in well under a second.

### Never take screenshots

Do not capture the screen — not with `xwd`, `import`, `scrot`, `gnome-screenshot`,
or any other tool — unless the user explicitly asks for one. This includes
"visual verification" of a result.

Verify by other means instead:

- **Window state** — `xdotool getwindowfocus getwindowname` (the title loses its
  tab-name prefix when tabs close).
- **Exit codes** — captured explicitly, not inferred from the tool result.
- **Lint and scripts** — `npx eslint`, `bash scripts/check-styles.sh`.
- **Git state** — `git status`, `git log`.
- **The user's own report** — for on-device behaviour, just ask.

If a result genuinely seems unverifiable without a screenshot, say that and
leave it unverified rather than capturing one unprompted.

Do **not** script this through the editor CLI. The editor is the VSCodium
**snap**, and that route is a dead end:

- `codium` on `PATH` is a symlink to `/usr/bin/snap`; invoking it through the
  symlink fails with `cannot execute binary file`, even though the binary is
  fine and `snap version` works.
- `/usr/bin/snap run codium --command ...` handles `--version` (`1.105.17075`)
  but `--command` always exits `1` with no output — snap confinement blocks the
  IPC socket to the running window.

`xdotool` sidesteps all of it by talking to X11 directly.

### 4. Confirm the tree state

```bash
git --no-pager status --short
git --no-pager log --oneline -3
```

Report honestly: uncommitted files are theirs, not a mess to tidy. **Never run
`git stash` or `git add` to make the status look clean** — see
`.clinerules/git.md`.

## Close-out summary

End the task with a short account:

- What changed, and what was verified (lint / script / manual).
- What was **not** verified, and how to check it — be explicit rather than
  implying completion.
- Anything deliberately left alone, with the reason, so it is not rediscovered
  as a surprise.
- Background processes: stopped here. Tabs and terminals: closed here via
  `xdotool`, unless the user asked to keep them.

Keep `activeContext.md` current if a Memory Bank exists — it is where the
open items from this task should be recorded before context resets.

## When a scripted step fails

Report it and stop — do not keep iterating on a workaround. A step that exits
non-zero with no output is a dead end. If it cannot be fixed in one attempt,
hand it back and say so plainly rather than burning rounds on it.

Say plainly what was and was not done. Never imply a cleanup happened when it
did not.
