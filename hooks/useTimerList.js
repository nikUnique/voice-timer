import { useCallback, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { updateSharedObject } from "../utils/sharedVariables";
import { getItemFromStorage, setItemInStorage, sleep } from "../utils/helpers";
import { useNavigation } from "@react-navigation/native";
import {
  useRecognizerData,
  useRefsData,
  useSoundData,
} from "../context/VoiceRecognizerContext";
import TimerInterface from "../components/TimerInterface";

export function useTimerList({
  timers,
  setTimers,
  setIsReady,
  setRecognizedCommand,
  flatListRef,
  REPEAT,
  lastCommandRef,
  containerHeight,
  setIsTaskStopped,
  setContainerHeight,
}) {
  const navigation = useNavigation();
  const [hasMounted, setHasMounted] = useState(false);
  const layoutTimeoutRef = useRef(null);
  const { recognizedCommand, dynamicGrammar, alertingTimerNamesRef } =
    useRecognizerData();
  const { activateTimerRef, secretIdentifierRef } = useRefsData();
  const { soundRef } = useSoundData();

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
  }, []);

  const clearCommand = useCallback(function () {
    setRecognizedCommand(" ");
  }, []);

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

    // console.log("isCommandNew", isCommandNew, numberOfRecognizedCommands);

    return (
      <TimerInterface
        time={item.time}
        name={item.name}
        recognizedCommand={isCommandNew}
        lastCommandRef={lastCommandRef}
        index={index}
        timerHeight={containerHeight}
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

  async function onLayoutHandler(e) {
    try {
      if (hasMounted) return;

      const { height } = e.nativeEvent.layout;

      let heightArr = await getItemFromStorage("timerListHeights");

      if (!heightArr) {
        heightArr = [height];
        await setItemInStorage("timerListHeights", [height]);
      }

      if (heightArr?.length >= 2) {
        heightArr = [];
        heightArr = [height];
      }

      if (heightArr?.length < 2) {
        await setItemInStorage("timerListHeights", [...heightArr, height]);
      }

      let countElementObj = heightArr.reduce((acc, element) => {
        acc[element] = (acc[element] || 0) + 1;
        return acc;
      }, {});

      const avgHeight = Object.entries(countElementObj).reduce(
        (acc, [key, value]) => {
          if (+acc[1] < +value) {
            return key;
          }
          return acc;
        },
        Object.entries(countElementObj)[0],
      )[0];

      setItemInStorage("calculatedTimerHeight", avgHeight);

      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }

      updateSharedObject({ timerListHeight: height });
      setContainerHeight(avgHeight);

      layoutTimeoutRef.current = setTimeout(function () {
        setHasMounted(true);
      }, 1000);
    } catch (error) {
      console.error("An error occurred in the onLayoutHandler", error);
    }
  }

  return {
    handleDelete,
    handleReadyState,
    clearCommand,
    renderTimer,
    onLayoutHandler,
  };
}
