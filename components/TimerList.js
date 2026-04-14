import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, FlatList, StyleSheet, View } from "react-native";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
  useSoundData,
} from "../context/VoiceRecognizerContext";
import { useSound } from "../hooks/useSound";
import { emitter, resetTimerEmitter } from "../utils/EventEmitter";
import { getItemFromStorage, setItemInStorage, sleep } from "../utils/helpers";

import { Colors } from "../constants/colors";
import { useSpeak } from "../hooks/useSpeak";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import MicStatus from "./MicStatus";
import TimerInterface from "./TimerInterface";
import TimerInterfaceButtons from "./TimerInterfaceButtons";

SplashScreen.preventAutoHideAsync();

export default function TimerList({ lastCommandRef, setIsTaskStopped }) {
  const navigation = useNavigation();
  const [isReady, setIsReady] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const [containerHeight, setContainerHeight] = useState();
  const [hasMounted, setHasMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const layoutTimeoutRef = useRef(null);

  const flatListRef = useRef(null);
  const flatListViewRef = useRef(null);

  const {
    recognizedCommand,
    recognizedTime,
    setRecognizedCommand,
    alertingTimerNamesRef,
    timers,
    setTimers,
    dynamicGrammar,
  } = useRecognizerData();

  const { soundRef } = useSoundData();

  const {
    secretIdentifierRef,
    recognizedCommandRef,
    commandsRef,
    activateTimerRef,
    leastTimeTimerRef,
    workingTimersRef,
  } = useRefsData();

  const { speak } = useSpeak();

  const { successSound, discoSound } = useSettingsData();
  const { playSoundGeneral, playSpecial } = useSound();

  const { REPEAT, RESET, RESET_FINISHED, DISCO } = commandsRef?.current
    ? commandsRef.current
    : {};

  useEffect(function () {
    if (timers?.length === 0) {
      handleReadyState(true);
    }
  }),
    [];

  useEffect(
    function () {
      emitter.all.delete(`updateList`);
      emitter.on(`updateList`, () => {
        setUpdateList(true);
        setTimeout(function () {
          setUpdateList(false);
        }, 1000);
      });
    },
    [updateList],
  );

  const sortedTimers = useMemo(() => timers.slice().reverse(), [timers]);

  const handleReadyState = useCallback(async function (isReady = true) {
    setIsReady(isReady);
    await sleep(0.25);
    await SplashScreen.hideAsync();
  }, []);

  const clearCommand = useCallback(
    function () {
      setRecognizedCommand(" ");
    },
    [setRecognizedCommand],
  );

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

  useEffect(
    function () {
      if (
        recognizedCommandRef.current?.toLowerCase() ===
        `${RESET_FINISHED} ${secretIdentifierRef.current?.split(" ").slice(2, -1)}`.trim()
      ) {
        playSoundGeneral({
          fileName: successSound,
          shouldStop: false,
        });
        speak("Completed timers reset");

        alertingTimerNamesRef?.current?.map((alertingTimer) =>
          resetTimerEmitter.emit(`${RESET} ${alertingTimer}`),
        );
      }

      // if (
      //   recognizedCommandRef.current &&
      //   recognizedCommandRef.current?.toLowerCase() === DISCO
      // ) {
      //   playSpecial({
      //     fileName: discoSound,
      //   });
      // }
    },
    [
      DISCO,
      RESET,
      RESET_FINISHED,
      alertingTimerNamesRef,
      discoSound,
      playSoundGeneral,
      playSpecial,
      recognizedCommandRef,
      recognizedTime,
      secretIdentifierRef,
      speak,
      successSound,
    ],
  );

  useEffect(
    function () {
      if (!isReady) return;
      try {
        if (!getSharedObject()?.notificationTap) {
          return;
        }

        workingTimersRef.current?.length &&
          containerHeight &&
          activateTimerRef.current(getSharedObject()?.leastTimer?.index || 0);

        if (workingTimersRef.current?.length && containerHeight) {
          updateSharedObject({ notificationTap: false });
        }
      } catch (error) {
        console.error(
          `An error occurred in calling activateTimerRef.current on mount: `,
          error,
        );
      }
    },
    [activateTimerRef, isReady, containerHeight, workingTimersRef, timers],
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

  useEffect(
    function () {
      const appStateListener = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (
            nextAppState === "active" &&
            isReady &&
            !getSharedObject()?.resetAllFinishedFromApp
          ) {
            handleReadyState(false);
          }
        },
      );

      return () => appStateListener.remove();
    },
    [activateTimerRef, handleReadyState, isReady, leastTimeTimerRef],
  );

  useEffect(function () {
    async function load() {
      const minHeight = await getItemFromStorage("calculatedTimerHeight");
      if (minHeight) {
        setContainerHeight(minHeight);
        // console.log("In the hook", Date.now());
      }
    }
    load();
  }, []);

  async function onLayoutHandler(e) {
    try {
      if (hasMounted) return;

      const { height } = e.nativeEvent.layout;

      let heightArr = await getItemFromStorage("timerListHeights");

      if (!heightArr) {
        heightArr = [height];
        await setItemInStorage("timerListHeights", [height]);
      }

      if (heightArr?.length < 20) {
        await setItemInStorage("timerListHeights", [...heightArr, height]);
      }

      let countElementObj = heightArr.reduce((acc, element) => {
        acc[element] = (acc[element] || 0) + 1;
        return acc;
      }, {});

      const minHeight = Object.entries(countElementObj).reduce(
        (acc, [key, value]) => {
          if (+acc[1] < +value) {
            return key;
          }
          return acc;
        },
        Object.entries(countElementObj)[0],
      )[0];

      setItemInStorage("calculatedTimerHeight", minHeight);

      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }

      updateSharedObject({ timerListHeight: height });

      setContainerHeight(minHeight);
      // console.log("In the onLayout", Date.now());

      layoutTimeoutRef.current = setTimeout(function () {
        setHasMounted(true);
      }, 1000);
    } catch (error) {
      console.error("An error occurred in the onLayoutHandler", error);
    }
  }

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        {<MicStatus />}

        {timers?.length > 0 && (
          <View
            style={[
              styles.timerList,

              !isReady || (!containerHeight && styles.timerListHidden),
            ]}
            ref={flatListViewRef}
            onLayout={onLayoutHandler}
          >
            {
              <FlatList
                contentContainerStyle={[{ paddingTop: 0, flexGrow: 1 }]}
                data={sortedTimers}
                extraData={sortedTimers}
                renderItem={renderTimer}
                keyExtractor={(item) => item?.id}
                // scrollEnabled={!isAlarmingScreen}
                pagingEnabled={true}
                snapToAlignment='start'
                keyboardShouldPersistTaps='handled'
                decelerationRate='fast'
                showsVerticalScrollIndicator={true}
                initialNumToRender={30}
                onScroll={(e) => {
                  const totalHeight = e.nativeEvent.layoutMeasurement.height;
                  const yPosition = e.nativeEvent.contentOffset.y;

                  const newIndex = Math.round(yPosition / totalHeight);
                  // console.log("newIndex", newIndex);

                  emitter.emit(`timerSelected-${newIndex}`);
                  if (newIndex !== currentIndex) {
                    setCurrentIndex(newIndex);
                  }
                }}
                ref={flatListRef}
                getItemLayout={(data, index) => ({
                  length: containerHeight,
                  offset: containerHeight * index,
                  index,
                })}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 30,
                }}
                onViewableItemsChanged={({ viewableItems, changed }) => {
                  // console.log("viewableItems", viewableItems);
                }}
              />
            }
            <TimerInterfaceButtons onDelete={handleDelete} />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  timerList: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  timerListHidden: {
    pointerEvents: "none",
  },
});
