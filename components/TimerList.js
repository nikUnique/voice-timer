import * as SplashScreen from "expo-splash-screen";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, FlatList, StyleSheet, View } from "react-native";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useSound } from "../hooks/useSound";
import { emitter, resetTimerEmitter } from "../utils/EventEmitter";
import { getItemFromStorage } from "../utils/helpers";

import { Colors } from "../constants/colors";
import { useSpeak } from "../hooks/useSpeak";
import { useTimerList } from "../hooks/useTimerList";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import MicStatus from "./MicStatus";
import TimerInterfaceButtons from "./TimerInterfaceButtons";

SplashScreen.preventAutoHideAsync();

export default function TimerList({ lastCommandRef, setIsTaskStopped }) {
  const [isReady, setIsReady] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const [containerHeight, setContainerHeight] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);
  const flatListViewRef = useRef(null);

  const {
    recognizedTime,
    setRecognizedCommand,
    alertingTimerNamesRef,
    timers,
    setTimers,
  } = useRecognizerData();

  const {
    secretIdentifierRef,
    recognizedCommandRef,
    commandsRef,
    activateTimerRef,
    leastTimeTimerRef,
    workingTimersRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const { REPEAT, RESET, RESET_FINISHED, DISCO } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { successSound, discoSound } = useSettingsData();
  const { playSoundGeneral, playSpecial } = useSound();
  const { handleDelete, handleReadyState, renderTimer, onLayoutHandler } =
    useTimerList({
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
    });

  const sortedTimers = useMemo(() => timers.slice().reverse(), [timers]);

  useEffect(
    function () {
      if (timers?.length === 0) {
        handleReadyState(true);
      }
    },
    [handleReadyState, timers?.length],
  );

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
    let isMounted = true;
    async function load() {
      const minHeight = await getItemFromStorage("calculatedTimerHeight");
      if (minHeight && isMounted) {
        setContainerHeight(minHeight);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        {<MicStatus />}

        {sortedTimers?.length > 0 && (
          <View
            style={[
              styles.timerList,

              !isReady || (!containerHeight && styles.timerListHidden),
            ]}
            ref={flatListViewRef}
            onLayout={onLayoutHandler}
          >
            <FlatList
              contentContainerStyle={{ paddingTop: 0 }}
              data={sortedTimers}
              extraData={sortedTimers}
              renderItem={renderTimer}
              keyExtractor={(item) => item?.id}
              pagingEnabled={true}
              removeClippedSubviews={false}
              // snapToAlignment='start'
              keyboardShouldPersistTaps='handled'
              decelerationRate='fast'
              estimatedItemSize={containerHeight}
              showsVerticalScrollIndicator={true}
              initialNumToRender={30}
              onScroll={(e) => {
                const totalHeight = e.nativeEvent.layoutMeasurement.height;
                const yPosition = e.nativeEvent.contentOffset.y;

                const newIndex = Math.round(yPosition / totalHeight);

                emitter.emit(`timerSelected-${newIndex}`);
                if (newIndex !== currentIndex) {
                  setCurrentIndex(newIndex);
                }
              }}
              ref={flatListRef}
              // getItemLayout={(data, index) => ({
              //   length: containerHeight,
              //   offset: containerHeight * index,
              //   index,
              // })}
              // overrideItemLayout={(layout) => {
              //   layout.size = containerHeight;
              // }}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 30,
              }}
            />

            {sortedTimers?.length > 0 && (
              <TimerInterfaceButtons onDelete={handleDelete} />
            )}
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
