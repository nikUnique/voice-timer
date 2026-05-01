import { useCallback } from "react";

import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { sleep } from "../utils/helpers";

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
  const { secretIdentifierRef, commandsRef } = useRefsData();

  const { successSound } = useSettingsData();

  const { CONTINUE, PAUSE, REPEAT, RESET, START } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { playSoundGeneral } = useSound();

  const { speak } = useSpeak();

  const executeCommand = useCallback(
    async function () {
      try {
        if (!recognizedCommand?.recognizedCommand) return;

        let availableCommands, isCommandValid, commandExecuted;

        if (!isActive) {
          availableCommands = [START, REPEAT, RESET];
          isCommandValid = availableCommands.some((command) =>
            recognizedCommand?.recognizedCommand.includes(command),
          );
        }

        if (!isActive && !isCommandValid) {
          console.log("The timer is not active 🥇", isCommandValid);

          return;
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
            `${CONTINUE} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          )
        ) {
          resumeTimerRef.current();
          activateTimerRef.current(index);

          commandExecuted = true;
          speak(`${name} resumed`);
        }
        if (
          lowerCommand.includes(
            `${RESET} ${name} ${secretIdentifierRef.current}`
              .toLocaleLowerCase()
              .trim(),
          ) &&
          ((isActive && isPaused) || timeLeftRef.current <= 0)
        ) {
          await resetTimerRef.current();

          commandExecuted = true;
          activateTimerRef.current(index);

          speak(`${name} reset`);
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
      isActive,
      START,
      REPEAT,
      isBusyRef,
      name,
      secretIdentifierRef,
      PAUSE,
      CONTINUE,
      RESET,
      isPaused,
      timeLeftRef,
      lastCommandRef,
      speak,
      clearCommand,
      startTimer,
      timerIsActiveRef,
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
