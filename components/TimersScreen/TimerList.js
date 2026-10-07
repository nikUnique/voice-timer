import * as SplashScreen from "expo-splash-screen";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, FlatList, StyleSheet, View } from "react-native";

import { Colors } from "../../constants/colors";
import { SPACE } from "../../constants/spacing";
import {
  useRecognizerData,
  useRefsData,
} from "../../context/VoiceRecognizerContext";
import { useGeneralVoiceCommands } from "../../hooks/TimersScreen/voiceControl/useGeneralVoiceCommands";
import { useTimerList } from "../../hooks/TimersScreen/timers/useTimerList";
import { Text } from "../../ui/AppText";
import Arrows from "../../ui/Arrows";
import { emitter } from "../../utils/EventEmitter";
import { getItemFromStorage } from "../../utils/helpers";
import {
  getSharedObject,
  updateSharedObject,
} from "../../utils/sharedVariables";
import MicStatus from "./MicStatus";
import SleepNotice from "./SleepNotice";
import TimerInterfaceButtons from "./TimerInterfaceButtons";

SplashScreen.preventAutoHideAsync();

export default function TimerList({
  lastCommandRef,
  setIsTaskStopped,
  isTimerSleeping,
  onTimerSleepChange,
}) {
  const [isReady, setIsReady] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  const flatListRef = useRef(null);

  const { setRecognizedCommand, timers, setTimers } = useRecognizerData();
  const {
    activateTimerRef,
    leastTimeTimerRef,
    workingTimersRef,
    isTimerSleepingRef,
  } = useRefsData();

  const {
    handleDelete,
    handleReadyState,
    renderTimer,
    onLayoutHandler,
    pauseMedia,
    resumeMedia,
  } = useTimerList({
    timers,
    setTimers,
    setIsReady,
    setRecognizedCommand,
    flatListRef,
    lastCommandRef,
    setIsTaskStopped,
  });

  const sortedTimers = useMemo(() => timers.slice().reverse(), [timers]);

  const isSingleTimer = sortedTimers?.length === 1;

  useEffect(
    function () {
      if (currentIndex > sortedTimers.length - 1) {
        setCurrentIndex(Math.max(sortedTimers.length - 1, 0));
      }
    },
    [currentIndex, sortedTimers.length],
  );

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

  useGeneralVoiceCommands({
    pauseMedia,
    resumeMedia,
    onTimerSleepChange,
  });

  useEffect(
    function () {
      if (!isReady) return;
      try {
        if (!getSharedObject()?.notificationTap) {
          return;
        }

        workingTimersRef.current?.length &&
          activateTimerRef.current(getSharedObject()?.leastTimer?.index || 0);

        if (workingTimersRef.current?.length) {
          updateSharedObject({ notificationTap: false });
        }
      } catch (error) {
        console.error(
          `An error occurred in calling activateTimerRef.current on mount: `,
          error,
        );
      }
    },
    [activateTimerRef, isReady, workingTimersRef, timers],
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

              (!isReady || (!isSingleTimer && !listHeight)) &&
                styles.timerListHidden,
            ]}
            onLayout={
              !isSingleTimer
                ? (e) => {
                    const { height } = e.nativeEvent.layout;
                    if (height && height !== listHeight) {
                      setListHeight(height);
                    }
                  }
                : undefined
            }
          >
            {isSingleTimer ? (
              <View style={styles.singleTimerWrapper}>
                {renderTimer({ item: sortedTimers[0], index: 0 })}
              </View>
            ) : (
              <FlatList
                contentContainerStyle={{ paddingTop: 0 }}
                data={sortedTimers}
                extraData={sortedTimers}
                renderItem={({ item, index }) => (
                  <View style={{ height: listHeight }}>
                    {renderTimer({ item, index })}
                  </View>
                )}
                keyExtractor={(item) => item?.id}
                pagingEnabled={true}
                removeClippedSubviews={false}
                keyboardShouldPersistTaps='handled'
                decelerationRate='fast'
                getItemLayout={(_data, index) => ({
                  length: listHeight,
                  offset: listHeight * index,
                  index,
                })}
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
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 30,
                }}
              />
            )}

            <SleepNotice isTimerSleeping={isTimerSleeping} />

            {timers.length > 1 && (
              <Text style={styles.paginationLabel}>
                {currentIndex + 1 + "/" + timers.length}
              </Text>
            )}

            {sortedTimers?.length > 0 && (
              <TimerInterfaceButtons onDelete={handleDelete} />
            )}

            {timers.length > 1 && (
              <Arrows
                currentIndex={currentIndex}
                timers={timers}
                flatListRef={flatListRef}
              />
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
  paginationLabel: {
    color: Colors.grayShade30,
    position: "absolute",
    top: SPACE.xl,
    right: SPACE.xl,
    textAlign: "right",
  },
  singleTimerWrapper: {
    flex: 1,
  },
  timerListHidden: {
    pointerEvents: "none",
  },
});
