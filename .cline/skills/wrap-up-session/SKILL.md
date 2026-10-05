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
- Editor **tabs**, but only by asking the user to press `Ctrl+Shift+W` — the
  snap-packaged editor has no usable CLI for this (see step 3).

**Cannot be closed from here:**
- Terminal panels or editor windows the *user* opened by hand.
- Anything outside this machine (a build running on a remote host, a browser).

When something cannot be closed, say so in the summary rather than implying it
was handled. Do not claim a cleanup that did not happen.

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

**Ask the user to press `Ctrl+Shift+W`** (View: Close All Editors). That is one
keystroke for them and instant, which beats any scripted alternative.

Do **not** try to script this. The editor here is the VSCodium **snap**, and its
CLI is not a usable route:

- `codium` on `PATH` is a symlink to `/usr/bin/snap`. Invoking it through the
  symlink fails with `cannot execute binary file`, even though the binary is
  fine and `snap version` works.
- Bypassing with `/usr/bin/snap run codium --command ...` gets as far as
  `--version` (`1.105.17075`) but `--command` still exits `1` with no output,
  because snap confinement blocks the IPC socket to the running window.

So `workbench.action.closeAllEditors` via CLI is a dead end on this machine, and
the shortcut reaches the same command without the confined IPC hop. Don't
rediscover this.

Terminals are a separate question — see below.

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
- Background processes: stopped here. Tabs and terminals: handed to the user as
  a keystroke, because they cannot be closed from here.

Keep `activeContext.md` current if a Memory Bank exists — it is where the
open items from this task should be recorded before context resets.

## When a scripted step fails

Report it and stop — do not keep iterating on a workaround. A step that exits
non-zero with no output is a dead end, and the user can usually finish it in one
keystroke. Burning several rounds diagnosing a CLI that cannot work is worse
than asking.

Say plainly what was and was not done. Never imply a cleanup happened when it
did not.
