# Voice Timer

A hands-free, voice-controlled timer for Android. Start, pause, resume, and
stop timers — and control media and phone calls — entirely by speaking.
Recognition runs fully offline (Vosk), so it works anywhere, with no network
and no cloud account.

> The point isn't that it's a timer — it's that you never have to touch the
> screen. Wet hands, busy hands, both hands full: just talk.

## Features

- **Voice-first control** — start, pause, resume, stop, and check your timers by
  speaking. Creating and deleting timers is the one thing you do on-screen;
  everything after that is hands-free.
- **Offline recognition** — Vosk runs on-device; no internet required, so it
  works anywhere.
- **Spoken feedback** — a short chime confirms your command landed, then the
  app speaks the result. A banner shows exactly what was heard, holds for five
  seconds, then fades. If the app doesn't confirm, you know it didn't hear you.
- **Runs in the background** — timers keep counting with the screen off; an
  ongoing notification tracks the active timer, and tapping it jumps straight
  to it.
- **Sleep state** — put the app to sleep to stop it listening. A small, curated
  set of commands (stop a ringing timer, media control, wake up) still works.
- **Media control** — pause/play all media and skip tracks by voice.
- **Phone calls** — add contacts on the Contacts screen, then call them by voice
  with a spoken confirmation ("if you want to call John, say yes, call John"),
  including short-call and minute-call variants that hang up for you.

## Voice commands

Commands are matched to timers by whole-word name, so `stop four` and
`stop fourteen` are never confused.

| Group | Say | Does |
|---|---|---|
| **Timers** | `start [name]` | Start a named timer |
| | `pause [name]` | Pause it |
| | `resume [name]` | Resume a paused timer |
| | `stop [name]` | Stop/reset it (while asleep, only a ringing timer) |
| | `repeat` | Re-run the last individual timer command |
| | `status [name]` | Report one timer's state |
| | `status report` | Report all timers |
| | `stop finished` | Reset every ringing timer |
| **Sleep** | `timer sleep` | Stop listening (most commands blocked) |
| | `timer wake up` | Resume listening |
| **Media** | `pause all media` | Pause all media playback |
| | `play all media` | Resume paused media |
| | `skip next` / `skip back` | Change track (off by default — enable in Settings) |
| **Calls** | `call [contact]` | Start a call, with voice confirmation |
| | `short call` / `minute call` | Same, but auto-hangs-up after a set time |
| | `answer call` | Answer an incoming call |
| **Utility** | `time` | Speak the current time |
| | `volume up` / `volume down` | Adjust device volume |

Anything blocked by the current state — media playing, the app asleep, or a
per-command toggle in Settings — is greyed out with a reason on the **Commands**
screen, which updates live while you use the app.

## Screens

- **Timers** — the main screen: the timer list, the recognized-command banner,
  and mic status.
- **Commands** — the full command reference, with live availability states.
- **Create Timer** — keypad-based timer creation.
- **Settings** — voice feedback, volume behavior, skip-command toggle, and more.
- **History / Contacts / About** — timer history, call contacts, and app info.

## Tech stack

- **React Native 0.86 · React 19 · Expo SDK 57** — bare workflow, so `android/`
  lives in the repo.
- **Vosk** (`react-native-vosk`) — offline speech recognition.
- **react-native-tts** — spoken feedback.
- **@notifee/react-native** — ongoing and alerting notifications.
- **react-native-background-actions** — background execution.
- **mitt** — the in-app event bus (`utils/EventEmitter.js`).
- Custom native modules: `AudioFocusModule` (mic ownership / Bluetooth mic) and
  `NativeUtilsModule` (device controls).

## Build & run

You'll need Node, the Expo toolchain, and an Android SDK. From the project root:

```bash
npm install         # installs deps and re-applies patches (patch-package)

npm run android     # build + install a debug build on a connected device
npm run bir         # assemble a release APK, install via adb, and launch
npm run adbLog      # filtered logcat (Vosk, notifications, JS errors)
npm run gradleClean # clean Gradle build artifacts
```

`npm run bir` is the main loop for testing a release build on-device.

> **A note on patches:** this repo patches `react-native-vosk`
> (`patches/react-native-vosk+2.1.7.patch`) to expose the recognizer's
> buffer-reset, so the app never mistakes its own text-to-speech for a command.
> `patch-package` re-applies it automatically on `npm install`. If you ever
> upgrade Vosk, regenerate the patch.

## Development

- **Lint & format:** `npx eslint <files>` and `npx prettier --check <files>`.
- **No test suite** — verification is lint plus on-device manual testing.
- A **Logs** screen exists for on-device debugging; it's disabled in navigation
  by default, since it's a development tool rather than a user feature.
- Design notes and project history live in [`memory-bank/`](./memory-bank).

## License

Released under the [MIT License](./LICENSE).

Copyright (c) 2026 Nik

