import { useCallback } from "react";
import { NativeModules } from "react-native";

import { useRefsData } from "../../../context/VoiceRecognizerContext";
import { sleep } from "../../../utils/helpers";

import { getSharedObject } from "../../../utils/sharedVariables";
import { useCommandFeedback } from "../../shared/useCommandFeedback";
import { useSpeak } from "../../shared/useSpeak";

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

  const { RESUME, PAUSE, REPEAT, STOP, START, STOP_MEDIA, STATUS } =
    commandsRef?.current ? commandsRef.current : {};

  const { chimeThenSpeak } = useCommandFeedback();

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

        // While asleep, only a ringing timer may be stopped; a paused one is
        // left alone. Non-STOP commands are already blocked; STOP now proceeds
        // only when THIS timer is actually alerting.
        if (isTimerSleepingRef.current) {
          const command =
            recognizedCommand?.recognizedCommand?.trim().toLowerCase() ?? "";
          const thisTimerIsRinging =
            getSharedObject().alertingTimerNames.includes(name);
          if (!command.includes(STOP) || !thisTimerIsRinging) {
            return;
          }
        }

        let commandExecuted = false;
        let spokenFeedback = "";

        if (
          recognizedCommand?.recognizedCommand
            ?.toLowerCase()
            .includes(
              `${STATUS} ${name} ${secretIdentifierRef.current}`
                .toLocaleLowerCase()
                .trim(),
            )
        ) {
          spokenFeedback = formatSingleTimerSpeech({
            name,
            remainingSeconds: timeLeftRef.current,
            paused: isPaused,
            ringing: getSharedObject().alertingTimerNames.includes(name),
            isActive,
          });

          commandExecuted = true;
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

          if (timerIsActiveRef.current && timeLeftRef.current > 0) {
            spokenFeedback = `${name} started`;
          }
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
          spokenFeedback = `${name} paused`;
        }
        if (
          lowerCommand.includes(
            `${RESUME} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          ) &&
          isPaused &&
          isActive
        ) {
          resumeTimerRef.current();
          activateTimerRef.current(index);

          commandExecuted = true;
          spokenFeedback = `${name} resumed`;
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

          spokenFeedback = `${name} stopped`;
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

          if (timerIsActiveRef.current) {
            spokenFeedback = `${name} started`;
          }
        }
        if (commandExecuted) {
          chimeThenSpeak(spokenFeedback);
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
      STOP,
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
      chimeThenSpeak,
    ],
  );

  return { executeCommand };
}
