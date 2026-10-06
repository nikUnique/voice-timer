# Uncertainty

## Stop and ask instead of guessing

If unsure about something, stop and ask the user. Do not guess, do not proceed
on an assumption, and do not present a guess as a finding.

This applies to what a value means, which code path runs, whether something is a
bug or intended behaviour, naming, scope, and whether a change is wanted at all.
One question is cheaper than a plausible wrong answer, especially when the wrong
answer gets committed.

### Ask when the code does not settle it

Stop before continuing if you cannot answer all of these from the code in front
of you:

- What does this value actually mean — `true`/`false` polarity, units, who set
  it and when?
- Which path actually runs at runtime, as opposed to which path exists?
- Does this look deliberate, or does it look like a bug?

### Mark what is verified

When reporting, separate the two rather than blending them:

- **verified** — read the file, can quote the line
- **assumed** — inferred from a partial reading, not confirmed

Never let an assumption read as a verified fact, and do not round a partial
reading into a confident whole. Naming a limitation once is not the same as
resolving it.

### Already cost this project twice

Two Commands-screen commits were wrong because a single hook was read and
treated as the entire pipeline. Both `useGeneralVoiceCommands` and
`useExecuteCommand` run on every utterance and gate on media state in
contradictory ways; neither is the whole story on its own. Before extending a
claim, check whether another hook or native module handles the same input.

### Not a reason to stall

Investigate first, ask second. Read the relevant code. Ask only when reading
does not settle the question, or when the choice is a preference that belongs to
the user rather than a fact to be discovered.
