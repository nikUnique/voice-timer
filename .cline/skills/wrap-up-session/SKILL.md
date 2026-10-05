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
- Editor **tabs and terminal panels**, via the IDE CLI if one is available
  (see below).

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

### 3. Close tabs and terminals opened during the work

If an IDE CLI is on `PATH`, use it — this is the only reliable way. Confirm
the binary exists first with `command -v`, and do not assume the VS Code name:

```bash
# On this machine the editor is the VSCodium snap.
command -v codium   # -> /snap/bin/codium

codium --command workbench.action.closeAllEditors
codium --command workbench.action.closeAllGroups
```

`code` is **not** on `PATH` here, so the VS Code command name will fail. The
snap wrapper is at `/snap/bin/codium`; there is no
`/snap/codium/current/usr/bin/codium`.

Closing *terminal panels* specifically is `workbench.action.closeAllGroups`
under View > Appearance, or close them via the command palette — pass the
matching command id if a terminal-specific one is needed.

If no IDE CLI is available, do not try to emulate this by killing processes —
instead **tell the user which tabs and terminals to close**, by name. Never
leave the impression that tabs were closed when they were not.

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
- Background processes and tabs: closed, or handed to the user to close.

Keep `activeContext.md` current if a Memory Bank exists — it is where the
open items from this task should be recorded before context resets.
