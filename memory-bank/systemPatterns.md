# System Patterns — voice-timer

## Screen architecture

Three layers, consistent across every screen:

```
screens/<Name>Screen.js      thin route wrapper — navigation callbacks only
components/<Name>Screen/     the UI, one directory per screen
hooks/<Name>Screen/          logic, grouped by concern
```

The wrapper holds no styling and no state. See `screens/LogsScreen.js` — five
lines, passes `onClose` down.

Inside `components/`, long style blocks move to a sibling `<Name>Styles.js`
(see `components/CommandsScreen/CommandsStyles.js`). Hooks group by concern:
`hooks/TimersScreen/voiceControl/`, `hooks/TimersScreen/notifications/`.
Truly shared hooks live in `hooks/shared/`.

## Styling

All visual values come from `constants/`: `colors.js` (`Colors`), `spacing.js`
(`SPACE`), `radius.js` (`RADIUS`), `typography.js` (`FONT`), `weight.js`
(`WEIGHT`). All text uses `Text` from `ui/AppText`, not `react-native`.

**These are conventions, not enforced rules.** The ESLint config explicitly
disables `react-native/no-color-literals` and `no-inline-styles`, and sets
`prettier/prettier` to `off`. Nothing stops raw values from being added — it has
to be caught by review or by the bundled skill script.

Full guidance lives in `.cline/skills/add-screen/SKILL.md`. Do not restate it
here.

## State and shared data

- `context/VoiceRecognizerContext.js` — recognizer state; consumed via
  `useRecognizerData()`, `useRefsData()`, `useSettingsData()`.
- `utils/sharedVariables.js` — `getSharedObject()`, the cross-component mutable
  state holding `runningTimerNames`, `pausedTimerNames`, `alertingTimerNames`.
  Read it directly where used; it is deliberately mutable and non-reactive.
- The codebase uses a **ref-plus-state pairing** pattern throughout. A `useState`
  drives re-render, and a matching `xRef` holds the current value for use inside
  callbacks and listeners that must not re-subscribe. Both are updated together.

## Voice recognition flow

1. Vosk model loads once (`useCommandsControl.load`).
2. A dynamic grammar is built from the current command set (`en_commands.js`).
3. `recordGrammar()` starts recognition, after checking mic permission and
   Bluetooth permission.
4. `onResult` in `addResultListener` filters results, then calls
   `setRecognizedCommand` / `setRecognizedTime`.
5. Consumers react: the command banner fades in, and command hooks execute.

### Why results are filtered before use

Two filters guard recognition output:

- Tokens matching `[unk]` or non-string entries are dropped.
- Words already spoken via TTS (`currentSpeechRef`) are removed, so the app
  does not recognize its own spoken feedback as a command.

There is also an `ignoreUntilRef` timestamp that ignores results for a window
after TTS. These exist because **without them the app recognizes its own voice
announcements as commands**, which loops.

## Native modules

Android-first, under `android/app/src/`:

| Module | Purpose |
| --- | --- |
| Vosk | speech recognition |
| `AudioFocusModule` | mic ownership, Bluetooth mic, TTS ducking |
| `Logcat` | native logs, surfaced by the in-app Logs screen |

These are load-bearing. Prefer extending them over reimplementing in JS.
`.clineignore` deliberately keeps `android/app/src/` and `ios/` readable.

## Command execution

`useExecuteCommand` interprets a recognized command per timer, with guards for
media playback, sleeping state, and already-started timers. Feedback goes
through `hooks/shared/useSpeak.js` (TTS) and the command banner.

## Persistence

`utils/storageHelpers.js` with AsyncStorage. Shared timer state is saved and
restored so state survives a force-close.
