---
name: add-screen
description: Create a new screen in this React Native (Expo, bare) voice-timer app, or add UI to an existing one. Use when adding a screen, route, settings section, list, or reusable UI component — covers the screens/ + components/ + hooks/ split, the design-token system (Colors, SPACE, RADIUS, FONT, WEIGHT), the shared Text component, navigation registration, and lint/verify steps. Also use for restyling or aligning an existing screen to project tokens.
---

# Adding or aligning a screen

This app (React Native 0.76, Expo SDK 52, bare workflow) has a strict
three-layer screen convention. Match it — do not invent a new structure.

## Architecture

```
screens/<Name>Screen.js      thin route wrapper — navigation only, no styling
components/<Name>Screen/     the actual UI, one directory per screen
hooks/<Name>Screen/          logic, split by concern
ui/                          shared primitives (Text, Section, IconButton…)
constants/                   design tokens
context/                     VoiceRecognizerContext + its hook
utils/                       helpers, storage, TTS, shared state
```

The wrapper is deliberately tiny. Compare `screens/LogsScreen.js`:

```jsx
import Logs from "../components/LogsScreen/Logs.js";

export default function LogsScreen({ navigation }) {
  return <Logs onClose={() => navigation.goBack()} />;
}
```

It passes callbacks down and holds no styling or state. Do not move logic here.

Inside `components/`, split by role when a file grows — this is the existing
pattern (e.g. `CommandsScreen/` has `Commands.js`, `CommandCard.js`,
`CommandsStyles.js`, `useCommandsList.js`). A `*Styles.js` file for long
style blocks is idiomatic here.

Hooks are grouped by screen and concern: `hooks/TimersScreen/voiceControl/`,
`hooks/TimersScreen/notifications/`. Shared hooks go in `hooks/shared/`.

## Design tokens — never raw values

This is the most-repeated project rule. **No raw hex, no magic numbers, no
direct `Text` from react-native.**

```jsx
import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import { Text } from "../../ui/AppText";
```

- `Text` must come from `ui/AppText` — it sets `includeFontPadding` based on
  the user's font scale. Importing `Text` from `react-native` is wrong.
- No JSX default `React` import needed (new JSX transform); React is already
  disabled in `react/react-in-jsx-scope`.
- Sort imports: `react` hooks first, then `react-native`, then locals
  alphabetically by path.
- Add a new color to `constants/colors.js` with a comment giving its
  provenance (open-color row, alpha percentage) — match that file's style.

**Deliberate exceptions:** `flex: 1`, `borderWidth: 1`, and `gap` are written
literally throughout the codebase; there are no tokens for them. Do not invent
tokens for these.

## Wiring a new route into navigation

Routes are registered in `App.js`. Check how the existing screens are declared
in the `Stack.Navigator` before adding an entry, and match the `options` block
(there is a `headerTintColor: Colors.primaryTint90` convention).

## Native code is part of this project

This app is not pure JS. Vosk, `AudioFocusModule`, `Logcat`, and the Bluetooth
mic all have native implementations under `android/app/src/`. `.clineignore`
deliberately keeps `android/app/src/` and `ios/` readable — do not treat native
edits as out of scope. Prefer the existing native modules over JS workarounds;
if a task seems to require reimplementing one, raise it before proceeding.

## Verify before reporting done

```bash
npx eslint <changed files>
```

Expect exit 0. Note that `no-unused-vars` is set to **warn**, not error, so
pre-existing warnings (e.g. `prevRecognizedCommandRef` in
`useCommandsControl.js`) can legitimately remain — report them as pre-existing
rather than silently "fixing" unrelated code.

The terminal wrapper in this environment often cannot capture output; redirect
to a file and `cat` it to get a trustworthy exit code:

```bash
npx eslint <files> > /tmp/lint.txt 2>&1; echo "EXIT=$?"; cat /tmp/lint.txt
```

## Commit

Match the existing style: imperative subject line, blank line, then explanatory
body paragraphs. Use a `fix(scope):` prefix for bug fixes, a bare imperative for
features and refactors. **Never run `git stash`** — see `.clinerules/git.md`.
Commit only when explicitly asked.
