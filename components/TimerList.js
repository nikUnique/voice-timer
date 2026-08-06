import * as SplashScreen from "expo-splash-screen";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  FlatList,
  NativeModules,
  StyleSheet,
  View,
} from "react-native";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useSound } from "../hooks/useSound";
import { emitter, resetTimerEmitter } from "../utils/EventEmitter";
import { getItemFromStorage, getTimePhrase, normalize } from "../utils/helpers";

import { VolumeManager } from "react-native-volume-manager";
import { Colors } from "../constants/colors";
import { useSpeak } from "../hooks/useSpeak";
import { useTimerList } from "../hooks/useTimerList";
import Arrows from "../ui/Arrows";
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
    isMediaPausedRef,
    isMediaPlayingRef,
    isTimerSleepingRef,
    isListeningRef,
    isMediaPausedManuallyRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const {
    REPEAT,
    STOP,
    STOP_FINISHED,
    DISCO,
    TIME,
    PLAY_MEDIA,
    STOP_MEDIA,
    STATUS_REPORT,
    TIMER_WAKE_UP,
    TIMER_GO_SLEEP,
    VOLUME_UP,
    VOLUME_DOWN,
    ANSWER_CALL,
  } = commandsRef?.current ? commandsRef.current : {};

  const { successSound, discoSound, isHeadsetBroken } = useSettingsData();
  const { playSoundGeneral, playSpecial } = useSound();
  const {
    handleDelete,
    handleReadyState,
    renderTimer,
    onLayoutHandler,
    formatStatusSpeech,
    formatRingingResetSpeech,
  } = useTimerList({
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

  const pauseMedia = useCallback(
    async function () {
      isMediaPausedRef.current = true;
      isMediaPausedManuallyRef.current = true;
      playSoundGeneral({
        fileName: successSound,
        shouldStop: false,
      });
      await speak("Media paused");
    },
    [
      isMediaPausedManuallyRef,
      isMediaPausedRef,
      playSoundGeneral,
      speak,
      successSound,
    ],
  );

  const resumeMedia = useCallback(
    async function () {
      await speak("Media resumed");
      await NativeModules.NativeUtilsModule.pressHeadsetButton();
      playSoundGeneral({
        fileName: successSound,
        shouldStop: false,
      });
      isMediaPausedRef.current = false;
      isMediaPausedManuallyRef.current = false;
    },
    [
      isMediaPausedManuallyRef,
      isMediaPausedRef,
      playSoundGeneral,
      speak,
      successSound,
    ],
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

  useEffect(
    function () {
      async function load() {
        isMediaPlayingRef.current =
          await NativeModules.AudioFocusModule.isMediaPlaying();
        if (isMediaPlayingRef.current) {
          if (recognizedCommandRef.current.includes(STOP_MEDIA)) {
            if (!isHeadsetBroken) {
              await NativeModules.NativeUtilsModule.pressHeadsetButton();
              pauseMedia();
            }
            if (isHeadsetBroken) {
              NativeModules.AudioFocusModule.requestAudioFocus(
                async (granted) => {
                  if (granted) {
                    pauseMedia();
                  }
                },
              );
            }
          }
        }
        if (
          isMediaPlayingRef.current &&
          !recognizedCommandRef.current.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current.includes(ANSWER_CALL)
        ) {
          console.log(
            "Stop the background media first before using other voice commands",
          );
          recognizedCommandRef.current = null;
          return;
        }

        if (
          recognizedCommandRef.current
            ?.toLowerCase()
            .trim()
            .includes(PLAY_MEDIA) &&
          PLAY_MEDIA &&
          !isMediaPlayingRef.current
        ) {
          if (!isHeadsetBroken) {
            await resumeMedia();
            await NativeModules.NativeUtilsModule.pressHeadsetButton();
          }
          if (isHeadsetBroken) {
            NativeModules.AudioFocusModule.toggleMedia(async (shouldTake) => {
              await resumeMedia();
            });
          }
        }

        if (
          recognizedCommandRef.current &&
          recognizedCommandRef.current
            .trim()
            .toLowerCase()
            .includes(ANSWER_CALL.toLowerCase())
        ) {
          console.log("I am trying to answer call 🤙");

          NativeModules.NativeUtilsModule.answerCall();
        }

        if (
          isTimerSleepingRef.current &&
          recognizedCommandRef.current &&
          !recognizedCommandRef.current.includes(TIMER_WAKE_UP) &&
          !recognizedCommandRef.current.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current.trim().toLowerCase().includes(STOP)
        ) {
          recognizedCommandRef.current = null;
          return;
        }

        if (
          recognizedCommandRef.current.includes(TIMER_GO_SLEEP) &&
          !isTimerSleepingRef.current
        ) {
          playSoundGeneral({
            fileName: successSound,
            shouldStop: false,
          });
          speak("Timer went to sleep");
          isTimerSleepingRef.current = true;
        }

        if (
          recognizedCommandRef.current.includes(TIMER_WAKE_UP) &&
          isTimerSleepingRef.current
        ) {
          playSoundGeneral({
            fileName: successSound,
            shouldStop: false,
          });
          speak("Timer ready");
          isTimerSleepingRef.current = false;
        }

        // Volume place
        if (recognizedCommandRef.current.includes(VOLUME_UP)) {
          const { volume } = await VolumeManager.getVolume("music");
          const percent = Math.round((volume + 0.1) * 10) / 10;

          if (percent <= 1) {
            await VolumeManager.setVolume(percent, { type: "music" });
            playSoundGeneral({
              fileName: successSound,
              shouldStop: false,
            });
            speak(`Volume ${percent * 100}`);
          }
        }

        if (recognizedCommandRef.current.includes(VOLUME_DOWN)) {
          const { volume } = await VolumeManager.getVolume("music");
          const percent = Math.round((volume - 0.1) * 10) / 10;

          await VolumeManager.setVolume(percent, { type: "music" });
          playSoundGeneral({
            fileName: successSound,
            shouldStop: false,
          });
          speak(`Volume ${percent * 100}`);
        }

        if (
          recognizedCommandRef.current
            ?.toLowerCase()
            .includes(
              `${STOP_FINISHED} ${secretIdentifierRef.current?.split(" ").slice(2, -1)}`.trim(),
            )
        ) {
          setTimeout(function () {
            playSoundGeneral({
              fileName: successSound,
              shouldStop: false,
            });
          }, 200);

          speak(formatRingingResetSpeech(alertingTimerNamesRef.current), 0.5);

          alertingTimerNamesRef?.current?.map((alertingTimer) =>
            resetTimerEmitter.emit(`${STOP} ${alertingTimer}`),
          );
        }

        const words = recognizedCommandRef.current?.split(" ").map(normalize);

        if (words.includes(TIME) && TIME) {
          speak(getTimePhrase(), 0.3);
        }

        if (
          recognizedCommandRef.current
            ?.toLowerCase()
            .trim()
            .includes(STATUS_REPORT) &&
          STATUS_REPORT
        ) {
          speak(
            formatStatusSpeech(
              getSharedObject().runningTimerNames,
              getSharedObject().pausedTimerNames,
              getSharedObject().alertingTimerNames,
            ),
            0.3,
          );
        }

        recognizedCommandRef.current = null;
      }

      load();
    },
    [
      ANSWER_CALL,
      DISCO,
      PLAY_MEDIA,
      STOP,
      STOP_FINISHED,
      STATUS_REPORT,
      STOP_MEDIA,
      TIME,
      TIMER_GO_SLEEP,
      TIMER_WAKE_UP,
      VOLUME_DOWN,
      VOLUME_UP,
      alertingTimerNamesRef,
      discoSound,
      formatRingingResetSpeech,
      formatStatusSpeech,
      isListeningRef,
      isMediaPausedManuallyRef,
      isMediaPausedRef,
      isMediaPlayingRef,
      isTimerSleepingRef,
      playSoundGeneral,
      playSpecial,
      recognizedCommandRef,
      recognizedTime,
      secretIdentifierRef,
      speak,
      successSound,
      isHeadsetBroken,
      pauseMedia,
      resumeMedia,
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
              viewabilityConfig={{
                itemVisiblePercentThreshold: 30,
              }}
            />

            {sortedTimers?.length > 0 && (
              <TimerInterfaceButtons onDelete={handleDelete} />
            )}
            <Arrows
              currentIndex={currentIndex}
              timers={timers}
            />
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
