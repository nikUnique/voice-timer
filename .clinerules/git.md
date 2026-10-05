# Git Rules

## Never use `git stash`

Never run `git stash`, `git stash push`, `git stash pop`, `git stash apply`,
`git stash drop`, `git stash clear`, or `git stash list` — in any form, for any
reason, including as a "quick check" or to compare against a baseline.

Working in progress is never stashed. Uncommitted changes stay in the working
tree until they are committed or explicitly discarded by the user.

This includes the "stash, re-run the check, pop" pattern for inspecting
pre-existing state. It silently rewrites the working tree, and a conflict,
interrupted command, or terminal interruption can leave the changes stuck in the
stash or applied on top of newer work. The risk is not worth the convenience.

### Inspect historical state without touching the working tree

Use these instead:

```bash
# State of a file as of a given commit — no working tree changes
git show HEAD:path/to/file.js

# Diff of working-tree changes — read only, safe
git --no-pager diff -- path/to/file.js

# Diff against a specific ref
git --no-pager diff HEAD~1 -- path/to/file.js

# List commits touching a path
git --no-pager log -p -- path/to/file.js
```

To check whether a lint warning or type error is pre-existing, read the file at
`HEAD` via `git show` and inspect it, or check out the single file into a
temporary location with `git show HEAD:path/to/file.js > /tmp/baseline.js`. Do
not mutate the repository state to find this out.

If a stash entry already exists and was not created deliberately by the user,
leave it alone and report it rather than applying or dropping it.

## Other constraints

- **Do not commit unless asked.** Stage and commit only when the user
  explicitly requests it, and commit exactly the files in scope for the task.
- **Do not push.** Leave publishing to the user unless they ask.
- **Do not amend, rebase, reset, or force.** Rewriting history is the user's
  call, not an automated cleanup step.
- **Do not add files to `.gitignore`** to silence an unexpected `git status`
  entry. Report it and ask.
- **Verify before committing.** Run the project's linter (and tests, if present)
  on the changed files, and confirm `git status` shows only the intended files.
