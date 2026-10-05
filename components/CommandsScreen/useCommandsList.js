import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { NativeModules } from "react-native";

import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { capitalize, normalize } from "../../utils/helpers";
import { CALL_TIMEOUT, PHONE_TIMEOUT } from "../../utils/config";
import * as defaultCommands from "../../utils/en_commands";

// Mirrors the real gating in useGeneralVoiceCommands, useExecuteCommand,
// useTimerSleepBlocking and useAlarmResetCommand.
//
// Order matters in useGeneralVoiceCommands: the media commands, skip, answer
// call and stop finished are all handled BEFORE the sleep check, so they still
// work while the timer sleeps. Everything after it does not.
//
// While media plays, only pausing it and skipping tracks are accepted.
const WORKS_WHILE_ASLEEP = new Set([
  "MEDIA",
  "NEXT",
  "PREV",
  "PLAY",
  "BULK",
  "STOP",
  "WAKE",
]);
const WORKS_WHILE_MEDIA_PLAYING = new Set(["MEDIA", "NEXT", "PREV"]);
// These describe media that is currently playing, so they do nothing while it
// is paused. "PLAY" is the opposite: it only makes sense when media is paused.
const NEEDS_MEDIA_PLAYING = new Set(["MEDIA", "NEXT", "PREV"]);

const ASLEEP_NOTE = "not available while the timer is asleep";
const MEDIA_PLAYING_NOTE =
  "not available while media is playing, pause it first";
const NO_MEDIA_NOTE = "not available, nothing is playing right now";
const ALREADY_PLAYING_NOTE = "not available, media is already playing";

export function useCommandsList() {
  const {
    isSkipCommandsEnabledRef,
    permitAnswerCallsRef,
    isVoiceFeedbackEnabled,
  } = useSettingsData();
  const { commandsRef, isMediaPlayingRef, isTimerSleepingRef } = useRefsData();

  // Commands are loaded asynchronously into a ref. The Commands screen can
  // mount before that load finishes, so render the bundled English commands
  // until the active command set is available rather than showing blank rows.
  const commands = commandsRef?.current ?? defaultCommands;

  const [isSkipEnabled, setIsSkipEnabled] = useState(
    () => isSkipCommandsEnabledRef?.current ?? false,
  );

  const [permitAnswerCalls, setPermitAnswerCalls] = useState(
    () => permitAnswerCallsRef?.current ?? false,
  );

  // Setting-based reasons are only attached when the setting is actually off,
  // so an enabled command never claims to be switched off.
  const skipNote = isSkipEnabled
    ? undefined
    : "skip commands are switched off in Settings";
  const voiceNote = isVoiceFeedbackEnabled
    ? undefined
    : "voice feedback is off, so the answer cannot be spoken";
  const callNote = permitAnswerCalls
    ? voiceNote
    : "answering calls by voice is switched off in Settings";

  // Media and sleep state live in refs because the command handlers read them
  // synchronously. They are copied into state here so the list can render, and
  // refreshed on focus since both can change while this screen is open.
  const [runtime, setRuntime] = useState({
    mediaPlaying: isMediaPlayingRef?.current ?? false,
    asleep: isTimerSleepingRef?.current ?? false,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsSkipEnabled(isSkipCommandsEnabledRef?.current ?? false);
      setPermitAnswerCalls(permitAnswerCallsRef?.current ?? false);
      setRuntime({
        mediaPlaying: isMediaPlayingRef?.current ?? false,
        asleep: isTimerSleepingRef?.current ?? false,
      });

      // The ref is only refreshed when a command is processed, so ask the
      // platform directly in case media started or stopped since then.
      Promise.resolve(NativeModules.AudioFocusModule?.isMediaPlaying?.()).then(
        (playing) => {
          if (!isActive) return;
          setRuntime((current) => ({
            ...current,
            mediaPlaying: Boolean(playing),
          }));
        },
      );

      return function () {
        isActive = false;
      };
    }, [
      isSkipCommandsEnabledRef,
      permitAnswerCallsRef,
      isMediaPlayingRef,
      isTimerSleepingRef,
    ]),
  );

  const { mediaPlaying, asleep } = runtime;

  // Returns why a command cannot be used right now, or an empty object when it
  // is usable. Both reasons are kept separate here so the card can show the one
  // the user can act on, and so the colour can hint at which kind it is.
  const statusNotes = useCallback(
    function (badge, settingNote) {
      const notes = {};

      if (settingNote) notes.settingNote = settingNote;

      if (asleep && !WORKS_WHILE_ASLEEP.has(badge)) {
        notes.stateNote = ASLEEP_NOTE;
      } else if (mediaPlaying && badge === "PLAY") {
        notes.stateNote = ALREADY_PLAYING_NOTE;
      } else if (mediaPlaying && !WORKS_WHILE_MEDIA_PLAYING.has(badge)) {
        notes.stateNote = MEDIA_PLAYING_NOTE;
      } else if (NEEDS_MEDIA_PLAYING.has(badge) && !mediaPlaying) {
        notes.stateNote = NO_MEDIA_NOTE;
      }

      return notes;
    },
    [asleep, mediaPlaying],
  );

  const {
    REPEAT = "",
    STOP = "",
    STOP_FINISHED = "",
    TIME = "",
    START = "",
    PAUSE = "",
    PLAY_MEDIA = "",
    STOP_MEDIA = "",
    RESUME = "",
    STATUS_REPORT = "",
    STATUS = "",
    TIMER_WAKE_UP = "",
    TIMER_GO_SLEEP = "",
    VOLUME_UP = "",
    VOLUME_DOWN = "",
    SKIP_NEXT = "",
    SKIP_PREVIOUS = "",
    CALL = "",
    PHONE = "",
  } = commands;

  return useMemo(
    () =>
      [
        {
          command: `${capitalize(START)} [timer name]`,
          example: `${capitalize(START)} Focus timer`,
          description: "Starts the named timer with its default duration.",
          icon: "play-outline",
          badge: "START",
        },
        {
          command: `${capitalize(PAUSE)} [timer name]`,
          example: `${capitalize(PAUSE)} Focus timer`,
          description: "Pauses the timer if it is running.",
          icon: "pause-outline",
          badge: "PAUSE",
        },
        {
          command: `${capitalize(RESUME)} [timer name]`,
          example: `${capitalize(RESUME)} Focus timer`,
          description: "Resumes the timer if it is paused.",
          icon: "play-skip-forward-outline",
          badge: "RESUME",
        },
        {
          command: `${capitalize(STOP)} [timer name]`,
          example: `${capitalize(STOP)} Focus timer`,
          description: "Stops the timer if it was paused.",
          icon: "refresh-outline",
          badge: "STOP",
        },
        {
          command: `${capitalize(REPEAT)}`,
          example: `${capitalize(REPEAT)}`,
          description: `Restarts the timer from the last individual timer command. Any command that used a specific timer counts - that timer will be restarted. E.g. if you last said '${normalize(START)} twenty minutes' or '${normalize(STOP)} twenty minutes', where 'twenty minutes' is one of your timers, saying '${normalize(REPEAT)}' restarts the 'twenty-minutes' timer.`,
          icon: "repeat-outline",
          badge: "REPEAT",
        },
        {
          command: `${capitalize(STOP_FINISHED)}`,
          example: `${capitalize(STOP_FINISHED)}`,
          description: "Stops all timers that have run out of time.",
          icon: "checkmark-done-outline",
          badge: "BULK",
        },
        {
          command: `${capitalize(TIME)}`,
          example: `${capitalize(TIME)}`,
          description: "Tells you the exact time.",
          icon: "time-outline",
          badge: "TIME",
          settingNote: voiceNote,
        },
        {
          command: `${capitalize(PLAY_MEDIA)}`,
          example: `${capitalize(PLAY_MEDIA)}`,
          description:
            "Resumes external media playback, so it only works while the media is paused.",
          icon: "play-circle-outline",
          badge: "PLAY",
        },
        {
          command: `${capitalize(STOP_MEDIA)}`,
          example: `${capitalize(STOP_MEDIA)}`,
          description: `Pauses external media, so it only works while something is playing. It and ${capitalize(SKIP_NEXT)} and ${capitalize(SKIP_PREVIOUS)} are the only commands that keep working once media is playing.`,
          icon: "stop-circle-outline",
          badge: "MEDIA",
        },
        {
          command: `${capitalize(STATUS_REPORT)}`,
          example: `${capitalize(STATUS_REPORT)}`,
          description:
            "Reads out how many timers are running, paused, or alerting, and their names. Says no timers are active if there are none.",
          icon: "list-outline",
          badge: "STATUS",
          settingNote: voiceNote,
        },
        {
          command: `${capitalize(STATUS)} [timer name]`,
          example: `${capitalize(STATUS)} Focus timer`,
          description:
            "Reads the current state of a single timer - whether it is running, paused, alarming, or not active, and how much time is left.",
          icon: "timer-outline",
          badge: "STATUS",
          settingNote: voiceNote,
        },
        {
          command: `${capitalize(TIMER_WAKE_UP)}`,
          example: `${capitalize(TIMER_WAKE_UP)}`,
          description: `Wakes the timer after sleep, so it responds to spoken commands that were disabled by ${TIMER_GO_SLEEP} command.`,
          icon: "mic-outline",
          badge: "WAKE",
        },
        {
          command: `${capitalize(TIMER_GO_SLEEP)}`,
          example: `${capitalize(TIMER_GO_SLEEP)}`,
          description: `Puts the timer to sleep. Spoken commands are ignored until you say "${capitalize(TIMER_WAKE_UP)}". These still work while asleep: "${capitalize(TIMER_WAKE_UP)}", "${capitalize(STOP_MEDIA)}", "${capitalize(PLAY_MEDIA)}", "${capitalize(SKIP_NEXT)}", "${capitalize(SKIP_PREVIOUS)}", "${capitalize(STOP_FINISHED)}" and "${capitalize(STOP)} [timer name]".`,
          icon: "mic-off-outline",
          badge: "SLEEP",
        },
        {
          command: `${capitalize(VOLUME_UP)}`,
          example: `${capitalize(VOLUME_UP)}`,
          description: "Raises media volume by 10%, up to the maximum.",
          icon: "volume-high-outline",
          badge: "VOL+",
        },
        {
          command: `${capitalize(VOLUME_DOWN)}`,
          example: `${capitalize(VOLUME_DOWN)}`,
          description: "Lowers media volume by 10%, down to zero.",
          icon: "volume-low-outline",
          badge: "VOL-",
        },
        {
          command: `${capitalize(SKIP_NEXT)}`,
          example: `${capitalize(SKIP_NEXT)}`,
          description:
            "Only works while media is playing. Sends the next-track command to the active media app, which decides the exact action. Off by default and can trigger by accident when misheard - enable it in Settings and use at your own risk.",
          icon: "play-skip-forward-outline",
          badge: "NEXT",
          settingNote: skipNote,
        },
        {
          command: `${capitalize(SKIP_PREVIOUS)}`,
          example: `${capitalize(SKIP_PREVIOUS)}`,
          description:
            "Only works while media is playing. Sends the previous-track command to the active media app, which decides the exact action. Off by default and can trigger by accident when misheard - enable it in Settings and use at your own risk.",
          icon: "play-skip-back-outline",
          badge: "PREV",
          settingNote: skipNote,
        },
        {
          command: `${capitalize(CALL)} [contact name]`,
          example: `${capitalize(CALL)} John`,
          description: `Asks you to confirm by voice, then calls the contact. No confirmation within ${CALL_TIMEOUT / 1000} seconds cancels it.`,
          icon: "call-outline",
          badge: "CALL",
          settingNote: callNote,
        },
        {
          command: `${capitalize(PHONE)} [contact name]`,
          example: `${capitalize(PHONE)} John`,
          description: `Uses the same voice confirmation as call, then places the call and ends it automatically after ${PHONE_TIMEOUT / 1000} seconds, whether it was picked up or not.`,
          icon: "notifications-outline",
          badge: "PHONE",
          settingNote: callNote,
        },
      ].map((entry) => ({
        ...entry,
        ...statusNotes(entry.badge, entry.settingNote),
      })),
    [
      START,
      PAUSE,
      RESUME,
      STOP,
      REPEAT,
      STOP_FINISHED,
      TIME,
      PLAY_MEDIA,
      STOP_MEDIA,
      STATUS_REPORT,
      STATUS,
      TIMER_WAKE_UP,
      TIMER_GO_SLEEP,
      VOLUME_UP,
      VOLUME_DOWN,
      SKIP_NEXT,
      skipNote,
      SKIP_PREVIOUS,
      CALL,
      callNote,
      PHONE,
      voiceNote,
      statusNotes,
    ],
  );
}
