# Timeouts

## Use as short a timeout as possible

Every shell command gets a `timeout`. Use the smallest value that covers the
command's real runtime. The timeout is a kill-switch for a hung command, not
headroom to be generous with.

A loose timeout is not free. When a command hangs, the turn waits out the full
duration before anything reports a failure. `timeout 30` on a script that runs
in 0.14 s buys nothing and can cost 30 s of dead time.

### Default to `timeout 5`

Raise only once you have seen the command take longer, and then set the
ceiling just above the observed runtime — not to a round number that feels
safe.

### Measured in this workspace

`/usr/bin/time`, this machine, shared-folder checkout:

| Command                               | Takes  |
| ------------------------------------- | ------ |
| `grep -rn` over `components/ ui/`     | 0.02 s |
| `git --no-pager diff`                 | 0.06 s |
| `git --no-pager status --short`       | 0.10 s |
| `node /tmp/*.js` helper scripts       | 0.14 s |
| `npx prettier --check <dir>`          | 0.90 s |
| `npx eslint components/ ui/ screens/` | 9.85 s |

So `timeout 5` covers everything here except whole-project lint, which takes
~10 s and gets `timeout 15`. Nothing in this repo needs 30, 60 or 90.

Treat the numbers as a floor to argue from, not a promise — re-measure if a
command surprises you.

### If it gets killed, measure before raising

A kill means it did not finish in time. Time the command, then set the
ceiling from that measurement. Do not bump the number until it stops failing;
that just converts a visibly hung command into a silently slow one.

### A reported non-completion is not a timeout problem

Runners occasionally report "completion could not be observed" for a command
that did finish. Raising the timeout does not answer that — check the real
exit state and output instead.
