import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";

import { useCallback, useEffect } from "react";

import TimerInterface from "../../../components/TimersScreen/TimerInterface";
import {
  useRecognizerData,
  useRefsData,
  useSoundData,
} from "../../../context/VoiceRecognizerContext";
import { setItemInStorage, sleep } from "../../../utils/helpers";
import { updateSharedObject } from "../../../utils/sharedVariables";
import { useCommandFeedback } from "../../shared/useCommandFeedback";

export function useTimerList({
  timers,
  setTimers,
  setIsReady,
  setRecognizedCommand,
  flatListRef,
  lastCommandRef,
  setIsTaskStopped,
}) {
  const navigation = useNavigation();

  const { recognizedCommand, dynamicGrammar, alertingTimerNamesRef } =
    useRecognizerData();
  const {
    activateTimerRef,
    secretIdentifierRef,
    isMediaPausedRef,
    commandsRef,
    isMediaPausedManuallyRef,
  } = useRefsData();

  const { REPEAT } = commandsRef?.current ? commandsRef.current : {};

  const { soundRef } = useSoundData();

  const { chimeThenSpeak } = useCommandFeedback();

  const handleDelete = useCallback(
    function handleDelete(timerName) {
      try {
        const timerToDelete = timers.find(
          (timer) => timer?.name.toLowerCase() === timerName.toLowerCase(),
        );

        let initialIndex = timers.findIndex(
          (timer) => timer?.name?.toLowerCase() === timerName.toLowerCase(),
        );

        let timerToDeleteIndex = initialIndex;

        const newTimersArray = timers.filter(
          (timer) => timer?.name !== timerToDelete?.name,
        );

        // It will be always less one index than the deletable item was, and in case if the item with index 0 was deleted, the selected item will be undefined because of -1 index, but when that happens the list is automatically scrolled by default to show another item where onScroll callback on the FlatList kicks in and updates the shared object with the name of the currently viewed timer
        let newSelectedTimer = timers[timerToDeleteIndex - 1];

        updateSharedObject({ name: newSelectedTimer?.name });

        setTimers(newTimersArray);
        setItemInStorage("timers", newTimersArray);

        if (!newTimersArray?.length) {
          navigation.replace("CreateTimerScreen");
        }
      } catch (error) {
        console.error(`An error occurred in the handleDelete function`, error);
      }
    },
    [navigation, setTimers, timers],
  );

  const handleReadyState = useCallback(async function (isReady = true) {
    setIsReady(isReady);
    await sleep(0.25);
    await SplashScreen.hideAsync();
  }, [setIsReady]);

  const clearCommand = useCallback(function () {
    setRecognizedCommand(" ");
  }, [setRecognizedCommand]);

  // Writing activateTimerRef.current during render is unsafe under React
  // 19 concurrent rendering (the closure can come from a discarded pass and
  // go stale during the cold-start re-render storm). Assign it in an effect
  // so the registered function is always the committed one.
  useEffect(
    function () {
      activateTimerRef.current = function activateTimer(index) {
        try {
          flatListRef?.current?.scrollToIndex({
            index,
            animated: true,
          });
        } catch (error) {
          console.error(`An error occurred during automatic scrolling`, error);
        }
      };
    },
    [activateTimerRef, flatListRef],
  );

  function renderTimer({ item, index }) {
    // If the command is new then the goal is to rerender the corresponding to the command child
    const nameBasedOnSecret = secretIdentifierRef.current
      ? recognizedCommand?.split(" ").slice(1, -1)
      : recognizedCommand?.split(" ").slice(1);

    const numberOfRecognizedCommands = dynamicGrammar.filter((command) => {
      return (
        typeof command !== "object" && recognizedCommand?.includes(command)
      );
    });

    const areNamesTheSame = nameBasedOnSecret
      ?.join(" ")
      ?.toLowerCase()
      .includes(item.name?.toLowerCase());

    const isRepeatCommand =
      recognizedCommand?.toLowerCase() ===
      `${REPEAT} ${secretIdentifierRef.current}`.trim();

    const lastCommandHasTimerName = lastCommandRef.current
      ?.toLowerCase()
      .includes(item.name?.toLowerCase());

    let isCommandNew =
      areNamesTheSame || (isRepeatCommand && lastCommandHasTimerName)
        ? { recognizedCommand }
        : undefined;

    if (
      numberOfRecognizedCommands.length > 1 &&
      recognizedCommand
        .toLowerCase()
        .trim()
        .includes(item.name.toLowerCase().trim())
    ) {
      isCommandNew =
        item.name.trim().split(" ").length > 1
          ? { recognizedCommand }
          : undefined;

      if (
        item.name.trim().split(" ").length === 1 &&
        !numberOfRecognizedCommands.filter(
          (timer) => timer.split(" ").length > 2,
        ).length
      ) {
        const longestCommand = numberOfRecognizedCommands.reduce(
          (acc, command) => {
            return acc.length > command.length ? acc : command;
          },
          numberOfRecognizedCommands[0],
        );

        isCommandNew = { recognizedCommand: longestCommand };
      }
    }

    return (
      <TimerInterface
        time={item.time}
        name={item.name}
        recognizedCommand={isCommandNew}
        lastCommandRef={lastCommandRef}
        index={index}
        activateTimerRef={activateTimerRef}
        clearCommand={clearCommand}
        handleReadyState={handleReadyState}
        soundRef={soundRef}
        alertingTimerNamesRef={alertingTimerNamesRef}
        setIsTaskStopped={setIsTaskStopped}
        onDelete={handleDelete}
      />
    );
  }

  const pauseMedia = useCallback(
    async function () {
      isMediaPausedRef.current = true;
      isMediaPausedManuallyRef.current = true;
      await chimeThenSpeak("Media paused");
    },
    [chimeThenSpeak, isMediaPausedManuallyRef, isMediaPausedRef],
  );

  const resumeMedia = useCallback(
    async function () {
      isMediaPausedRef.current = false;
      isMediaPausedManuallyRef.current = false;
      await chimeThenSpeak("Media resumed");
    },
    [chimeThenSpeak, isMediaPausedManuallyRef, isMediaPausedRef],
  );

  return {
    handleDelete,
    handleReadyState,
    clearCommand,
    renderTimer,
    pauseMedia,
    resumeMedia,
  };
}
