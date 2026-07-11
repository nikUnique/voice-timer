import { useCallback } from "react";

import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { sleep } from "../utils/helpers";

import { NativeModules } from "react-native";
import { getSharedObject } from "../utils/sharedVariables";
import { useSound } from "./useSound";
import { useSpeak } from "./useSpeak";

export function useExecuteCommand({
  recognizedCommand,
  isActive,
  name,
  isBusyRef,
  clearCommand,
  startTimer,
  timerIsActiveRef,
  timeLeftRef,
  pauseTimerRef,
  resumeTimerRef,
  isPaused,
  resetTimerRef,
  lastCommandRef,
  activateTimerRef,
  index,
}) {
  const {
    secretIdentifierRef,
    commandsRef,
    isMediaPlayingRef,
    isTimerSleepingRef,
  } = useRefsData();

  const { successSound } = useSettingsData();

  const { RESUME, PAUSE, REPEAT, STOP, START, STOP_MEDIA, STATUS } =
    commandsRef?.current ? commandsRef.current : {};

  const { playSoundGeneral } = useSound();

  const { speak } = useSpeak();

  const formatSingleTimerSpeech = useCallback(
    ({ name, remainingSeconds, paused, ringing, isActive }) => {
      if (!ringing && !isActive) return `${name} is not active.`;
      if (ringing) return `${name} is ringing.`;

      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;

      const timeStr =
        m > 0 && s > 0
          ? `${m} minute${m !== 1 ? "s" : ""} ${s} second${s !== 1 ? "s" : ""}`
          : m > 0
            ? `${m} minute${m !== 1 ? "s" : ""}`
            : `${s} second${s !== 1 ? "s" : ""}`;

      const state = paused ? "paused" : "running";
      return `${name} is ${state}. ${timeStr} left.`;
    },
    [],
  );

  const executeCommand = useCallback(
    async function () {
      try {
        if (!recognizedCommand?.recognizedCommand) return;

        isMediaPlayingRef.current =
          await NativeModules.AudioFocusModule.isMediaPlaying();

        if (isMediaPlayingRef.current) {
          if (recognizedCommand?.recognizedCommand.includes(STOP_MEDIA))
            NativeModules.AudioFocusModule.requestAudioFocus((granted) => {
              if (granted) speak("Media paused");
            });
        }
        if (
          isMediaPlayingRef.current &&
          !recognizedCommand?.recognizedCommand.includes(STOP_MEDIA)
        ) {
          console.log(
            "Stop the background media first before using other voice commands - useExecuteCommand",
          );

          return;
        }

        if (
          isTimerSleepingRef.current &&
          !recognizedCommand?.recognizedCommand
            .trim()
            .toLowerCase()
            .includes(STOP)
        ) {
          return;
        }

        if (
          recognizedCommand?.recognizedCommand
            ?.toLowerCase()
            .includes(
              `${STATUS} ${name} ${secretIdentifierRef.current}`
                .toLocaleLowerCase()
                .trim(),
            )
        ) {
          speak(
            formatSingleTimerSpeech({
              name,
              remainingSeconds: timeLeftRef.current,
              paused: isPaused,
              ringing: getSharedObject().alertingTimerNames.includes(name),
              isActive,
            }),
          );

          commandExecuted = true;
        }

        let availableCommands, isCommandValid, commandExecuted;

        if (!isActive) {
          availableCommands = [START, REPEAT, STOP];
          isCommandValid = availableCommands.some((command) =>
            recognizedCommand?.recognizedCommand.includes(command),
          );
        }

        if (
          (isActive && recognizedCommand?.recognizedCommand.includes(START)) ||
          (isActive && recognizedCommand?.recognizedCommand.includes(REPEAT))
        ) {
          console.log("The timer has already started 🏖️");

          speak(`The timer ${name} is already active`);

          return;
        }

        if (isBusyRef.current) {
          clearCommand();
          return;
        }

        setTimeout(function () {
          isBusyRef.current = false;
        }, 1000);
        isBusyRef.current = true;

        let lowerCommand = recognizedCommand?.recognizedCommand?.toLowerCase();

        const nameInCommand = lowerCommand
          .split(" ")
          .filter((word) => name.toLowerCase().includes(word));

        if (!nameInCommand.length && lowerCommand !== REPEAT) {
          console.log("There is no such a command 😶");
          return;
        }

        if (
          lowerCommand.includes(
            `${START} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          )
        ) {
          startTimer();
          commandExecuted = true;

          timerIsActiveRef.current &&
            timeLeftRef.current > 0 &&
            speak(`${name} started`);
        }
        if (
          timerIsActiveRef.current &&
          timeLeftRef.current > 0 &&
          lowerCommand.includes(
            `${PAUSE} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          )
        ) {
          pauseTimerRef.current();
          activateTimerRef.current(index);

          commandExecuted = true;
          speak(`${name} paused`);
        }
        if (
          lowerCommand.includes(
            `${RESUME} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          ) &&
          isPaused
        ) {
          resumeTimerRef.current();
          activateTimerRef.current(index);

          commandExecuted = true;
          speak(`${name} resumed`);
        }
        if (
          lowerCommand.includes(
            `${STOP} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          ) &&
          ((isActive && isPaused) || timeLeftRef.current <= 0)
        ) {
          await resetTimerRef.current();

          commandExecuted = true;
          activateTimerRef.current(index);

          speak(`${name} stopped`);
        }

        const nameBasedOnSecret = secretIdentifierRef.current
          ? lastCommandRef.current?.split(" ").slice(1, -1)
          : lastCommandRef.current?.split(" ").slice(1);

        if (
          lowerCommand === `${REPEAT} ${secretIdentifierRef.current}`.trim() &&
          nameBasedOnSecret.join(" ").toLowerCase() ===
            name.toLowerCase().trim() &&
          lowerCommand !== "" &&
          (isPaused || !isActive)
        ) {
          await resetTimerRef.current();
          await sleep(0.1);
          await startTimer("repeat f");
          commandExecuted = true;

          timerIsActiveRef.current && speak(`${name} started`);
        }
        if (commandExecuted) {
          setTimeout(function () {
            playSoundGeneral({
              fileName: successSound,
              shouldStop: false,
            });
          }, 200);
        }
      } catch (error) {
        console.error(`An error occurred in executeCommand function 🦸`, error);
      } finally {
        clearCommand("");
      }
    },
    [
      recognizedCommand?.recognizedCommand,
      isMediaPlayingRef,
      STOP_MEDIA,
      isTimerSleepingRef,
      STATUS,
      name,
      secretIdentifierRef,
      isActive,
      START,
      REPEAT,
      isBusyRef,
      timerIsActiveRef,
      timeLeftRef,
      PAUSE,
      RESUME,
      isPaused,
      STOP,
      lastCommandRef,
      speak,
      formatSingleTimerSpeech,
      clearCommand,
      startTimer,
      pauseTimerRef,
      activateTimerRef,
      index,
      resumeTimerRef,
      resetTimerRef,
      playSoundGeneral,
      successSound,
    ],
  );

  return { executeCommand };
}
