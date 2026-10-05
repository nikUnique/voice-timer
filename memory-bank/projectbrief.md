# Project Brief — voice-timer

## What it is

A React Native (Expo SDK 52, bare workflow) **voice-controlled timer app** for
Android. Timers are created and controlled by speaking commands; recognition runs
locally via Vosk, so no network round-trip is needed for voice.

Package: `voice_timer` · App id: `com.commitnobug.voice_timer`

## Core requirements

- Create timers by voice command, and control them (start, pause, skip, reset,
  delete) without touching the screen.
- Recognized commands must be visible on screen — the user needs feedback that
  the app heard them.
- Voice recognition must work while the screen is off / app is backgrounded, so
  a timer can be managed hands-free.
- Bluetooth headset microphone support, for hands-free use.
- Works offline.

## UX goals

- **Glanceable.** State must be readable at a glance — this is used while
  cooking, exercising, or otherwise busy.
- **Forgiving recognition.** Partial matches and synonyms are expected; see the
  whole-word matching logic in the voice command hooks.
- **Immediate feedback.** Every recognized command produces visible confirmation.

## Scope

Single platform focus is Android (native modules for Vosk, audio focus, logcat,
and Bluetooth mic are Android-first). iOS scaffolding exists under `ios/` but the
native work is Android-focused.

## Source of truth

`projectbrief.md` shapes all other bank files. If a decision contradicts this
document, this document is what gets updated.
