# Memory Bank

> Upstream custom instructions (agent0ai Memory Bank, reproduced so this repo
> carries them for collaborators), plus project-specific notes at the bottom.

# Cline's Memory Bank

I am Cline, an expert software engineer with a unique characteristic: my memory
resets completely between sessions. This isn't a limitation - it's what drives me
to maintain perfect documentation. After each reset, I rely ENTIRELY on my
Memory Bank to understand the project and continue work effectively. I MUST read
ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in
Markdown format. Files build upon each other in a clear hierarchy:

### Core Files (Required)

1. `projectbrief.md` - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope
2. `productContext.md` - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals
3. `activeContext.md` - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights
4. `systemPatterns.md` - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths
5. `techContext.md` - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns
6. `progress.md` - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

### Additional Context

Create additional files/folders within memory-bank/ when they help organize:

- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Documentation Updates

Memory Bank updates occur when:

1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is
my only link to previous work. It must be maintained with precision and clarity,
as my effectiveness depends entirely on its accuracy.

---

## Project notes — voice-timer

Added for this repo. Not part of the upstream text.

### Commands

| Say                               | Effect                                      |
| --------------------------------- | ------------------------------------------- |
| `initialize memory bank`          | Create the initial `memory-bank/` structure |
| `follow your custom instructions` | Read the bank and resume where we left off  |
| `update memory bank`              | Review and update all bank files            |

### Where the bank sits

`memory-bank/` at the repo root — plain markdown, committed, so it is shared
with collaborators and reviewed in diffs. Not in `.clineignore`, so it stays
readable.

### Do not duplicate these files

This bank is for state and history, not for conventions. Several topics are
already covered and must be documented once, in one place:

| Topic                                             | Source of truth                                       |
| ------------------------------------------------- | ----------------------------------------------------- |
| Git rules (never `git stash`, commit/push policy) | `.clinerules/git.md`                                  |
| Uncertainty (ask vs guess, verified vs assumed)   | `.clinerules/uncertainty.md`                          |
| Shell timeouts (shortest that covers the command) | `.clinerules/timeouts.md`                             |
| Screen architecture, design tokens, verify steps  | `.cline/skills/add-screen/SKILL.md`                   |
| Token values                                      | `constants/*.js` — read the files, don't restate them |
| Build / run commands                              | `package.json` scripts                                |

In the bank, reference these by path. Duplicated conventions drift, and the
copy in the bank is the one that goes stale.

### Cost

This rule is always active, so the text above is in every session's context.
That is the tradeoff the docs flag. If it becomes a problem, convert it to a
conditional rule with `paths: ["memory-bank/**"]` so it only loads when the
bank is actually being touched.

Keep `techContext.md` and `systemPatterns.md` factual and short; prefer links to
real files over prose descriptions of them.

### What belongs in `activeContext.md`

This project is small and moves in bursts, so this file should stay tight. It is
not a changelog — `git log` already is one. Record only what git cannot answer:
what is in flight, what was tried and rejected, and why a decision was made.
