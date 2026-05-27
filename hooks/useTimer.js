/* eslint-disable no-constant-condition */
import notifee from "@notifee/react-native";
import { useCallback, useEffect, useMemo } from "react";
import { AppState, NativeModules } from "react-native";
import Tts from "react-native-tts";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { getItemFromStorage, setItemInStorage, sleep } from "../utils/helpers";

import { useNavigation } from "@react-navigation/native";
import { getSharedObject } from "../utils/sharedVariables";
import { useSettings } from "./useSettings";
import { useSound } from "./useSound";

let delay = 10800;

export function useTimer() {
  const navigation = useNavigation();
  const { playSound, stopSound } = useSound();
  const { setTimers, setEditableTimers } = useRecognizerData();
  const { isVoiceFeedbackEnabled } = useSettingsData();

  const {
    notificationIdRef,
    isFullScreenNotificationRef,
    appStateRef,
    wasActiveBeforeLockRef,
    previousLockedRef,
    isListeningRef,
    setIsListening,
    alertingTimerNamesRef,
    allTimersRef,
    isMediaPausedRef,
    ignoreUntilRef,
    isMediaPausedManuallyRef,
  } = useRefsData();

  useSettings();

  const options = useMemo(
    () => ({
      taskName: "Timer",
      taskTitle: "App is keeping your timer active",
      taskDesc: "Keeps your timer active. You can hide this notification.",
      taskIcon: {
        name: "ic_launcher_notification",
        type: "drawable",
      },
      color: "#edf2ff",
      linkingURI: "timer_with_commands://timer", // Optional deep linking URI
    }),
    [],
  );

  const backgroundTask = useCallback(async () => {
    try {
      while (true) {
        if (!getSharedObject()?.isTaskRunning) {
          break;
        }

        console.log("background task works 🤴");

        await sleep(delay);
      }
    } catch (error) {
      console.error("Error with task:", error);
    }
  }, []);

  const playSoundWrapper = useCallback(
    async ({ ...properties }) => {
      await playSound({ ...properties });
    },
    [playSound],
  );

  const stopSoundWrapper = useCallback(
    async ({ alertingTimerNames }) => {
      if (alertingTimerNames.length !== 0) {
        return;
      }
      await stopSound();
    },
    [stopSound],
  );

  const updateAlertingTimerNames = useCallback(
    (name) => {
      if (alertingTimerNamesRef.current.includes(name)) return;

      alertingTimerNamesRef.current = [...alertingTimerNamesRef.current, name];
      setItemInStorage("alertingTimerNames", alertingTimerNamesRef.current);
    },
    [alertingTimerNamesRef],
  );
  const releaseAudioFocus = useCallback(
    function () {
      if (
        !isMediaPausedRef.current &&
        !isMediaPausedManuallyRef.current &&
        !getSharedObject().alertingTimerNames.length
      ) {
        NativeModules.AudioFocusModule.releaseAudioFocus();
      }
    },
    [isMediaPausedManuallyRef, isMediaPausedRef],
  );

  const startTalking = useCallback(
    function startTalking() {
      isListeningRef.current = false;
      setIsListening(false);
    },
    [isListeningRef, setIsListening],
  );

  const doneTalking = useCallback(
    async function doneTalking(e) {
      releaseAudioFocus();

      if (isVoiceFeedbackEnabled) {
        ignoreUntilRef.current = Date.now() + 2000;
      }

      // await sleep(2 - voiceFeedbackSpeedRef.current);
      console.log("Done talking");
      isListeningRef.current = true;
      setIsListening(true);
    },
    [
      ignoreUntilRef,
      isListeningRef,
      isVoiceFeedbackEnabled,
      releaseAudioFocus,
      setIsListening,
    ],
  );

  const errorTalking = useCallback(
    function errorTalking() {
      releaseAudioFocus();
      console.error("An error occurred during speech utterance");
    },
    [releaseAudioFocus],
  );

  useEffect(
    function () {
      Tts.removeAllListeners("tts-start");
      Tts.removeAllListeners("tts-finish");
      Tts.removeAllListeners("tts-error");
      Tts.removeAllListeners("tts-cancel");
      Tts.addEventListener("tts-start", startTalking);
      Tts.addEventListener("tts-finish", (e) => {
        doneTalking(e);
      });
      Tts.addEventListener("tts-cancel", releaseAudioFocus);
      Tts.addEventListener("tts-error", errorTalking);
    },
    [doneTalking, errorTalking, releaseAudioFocus, startTalking],
  );

  useEffect(
    function () {
      async function load() {
        const activity =
          await NativeModules.NativeUtilsModule.getCurrentActivityName();
        isFullScreenNotificationRef.current = activity;

        const isLockedBox =
          await NativeModules.NativeUtilsModule.isPhoneLocked();

        if (!isLockedBox) {
          NativeModules.NativeUtilsModule.forbidShowingWhenLocked();
        }
      }
      load();
    },
    [isFullScreenNotificationRef],
  );

  const transitionToActive = useCallback(
    async function load(nextAppState) {
      try {
        const isPhoneLocked =
          await NativeModules.NativeUtilsModule.isPhoneLocked();
        if (!isPhoneLocked) {
          NativeModules.NativeUtilsModule.forbidShowingWhenLocked();
        }

        setTimeout(async function () {
          const isLocked =
            await NativeModules.NativeUtilsModule.isPhoneLocked();

          if (
            nextAppState !== "active" &&
            appStateRef?.current === "active" &&
            !previousLockedRef?.current &&
            isLocked
          ) {
            wasActiveBeforeLockRef.current = true;
          }
          previousLockedRef.current = isLocked;
          appStateRef.current = nextAppState;
        }, 400);

        if (AppState.currentState === "active") {
          notificationIdRef.current = "92901";

          setTimeout(() => {
            notifee.cancelDisplayedNotification("92901");
          }, 50);
        }

        if (AppState.currentState !== "active") {
          setItemInStorage("state", allTimersRef.current);
        }
      } catch (error) {
        console.error(
          `An error occurred in appStateListener in useTimer`,
          error,
        );
      }
    },
    [
      allTimersRef,
      appStateRef,
      notificationIdRef,
      previousLockedRef,
      wasActiveBeforeLockRef,
    ],
  );

  useEffect(
    function () {
      transitionToActive();
      const appStateListener = AppState.addEventListener(
        "change",
        transitionToActive,
      );

      return () => appStateListener.remove();
    },
    [
      appStateRef,
      notificationIdRef,
      previousLockedRef,
      transitionToActive,
      wasActiveBeforeLockRef,
    ],
  );

  useEffect(
    function () {
      async function load() {
        try {
          const timers = await getItemFromStorage("timers");

          if (timers) {
            setTimers(timers?.filter((timer) => timer.id && timer));
          }

          if (!timers || timers.length === 0) {
            navigation.replace("CreateTimerScreen");
          }
        } catch (error) {
          console.error(
            `An error occurred in the loading of timers from async storage`,
            error,
          );
        }
      }
      load();
    },
    [allTimersRef, navigation, setEditableTimers, setTimers],
  );

  return {
    options,
    backgroundTask,
    playSoundWrapper,
    stopSoundWrapper,
    updateAlertingTimerNames,
  };
}
