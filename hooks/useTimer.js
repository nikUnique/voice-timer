/* eslint-disable no-constant-condition */
import notifee from "@notifee/react-native";
import { useCallback, useEffect, useMemo } from "react";
import { AppState, NativeModules } from "react-native";
import Tts from "react-native-tts";

import {
  useRecognizerData,
  useRefsData,
} from "../context/VoiceRecognizerContext";
import { getItemFromStorage, setItemInStorage, sleep } from "../utils/helpers";

import { useNavigation } from "@react-navigation/native";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import { useSettings } from "./useSettings";
import { useSound } from "./useSound";

let isTaskRunning;
let delay = 900;

export function useTimer() {
  const navigation = useNavigation();
  const { playSound, stopSound } = useSound();
  const { setTimers, setEditableTimers } = useRecognizerData();

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
    []
  );

  const backgroundTask = useCallback(async () => {
    try {
      updateSharedObject({ isTaskRunning: true });

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
    [playSound]
  );

  const stopSoundWrapper = useCallback(
    async ({ alertingTimers }) => {
      if (alertingTimers.length !== 0) {
        return;
      }
      await stopSound();
    },
    [stopSound]
  );

  const updateAlertingTimers = useCallback(
    (name) => {
      if (alertingTimerNamesRef.current.includes(name)) return;

      alertingTimerNamesRef.current = [...alertingTimerNamesRef.current, name];
      setItemInStorage("alertingTimerNames", alertingTimerNamesRef.current);
    },
    [alertingTimerNamesRef]
  );

  const startTalking = useCallback(
    function startTalking() {
      isListeningRef.current = false;
      setIsListening(false);
    },
    [isListeningRef, setIsListening]
  );

  const doneTalking = useCallback(
    function doneTalking() {
      isListeningRef.current = true;
      setIsListening(true);
    },
    [isListeningRef, setIsListening]
  );

  const errorTalking = useCallback(function errorTalking() {
    console.error("An error occured during speech utterance");
  }, []);

  useEffect(
    function () {
      Tts.setDefaultRate(0.5);
      Tts.removeAllListeners("tts-start");
      Tts.removeAllListeners("tts-finish");
      Tts.removeAllListeners("tts-error");
      Tts.addEventListener("tts-start", startTalking);
      Tts.addEventListener("tts-finish", doneTalking);
      Tts.addEventListener("tts-error", errorTalking);
    },
    [doneTalking, errorTalking, startTalking]
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
    [isFullScreenNotificationRef]
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
            // notifee.cancelDisplayedNotifications();
            notifee.cancelDisplayedNotification("92901");
            // console.log(
            //   "Ongoing notification is canceled 🦋",
            //   AppState.currentState
            // );
          }, 50);
          // await notifee.stopForegroundService();
        }

        if (AppState.currentState !== "active") {
          setItemInStorage("state", allTimersRef.current);
        }
      } catch (error) {
        console.error(
          `An error occured in appStateListener in useTimer`,
          error
        );
      }
    },
    [
      allTimersRef,
      appStateRef,
      notificationIdRef,
      previousLockedRef,
      wasActiveBeforeLockRef,
    ]
  );

  useEffect(
    function () {
      transitionToActive();
      const appStateListener = AppState.addEventListener(
        "change",
        transitionToActive
      );

      return () => appStateListener.remove();
    },
    [
      appStateRef,
      notificationIdRef,
      previousLockedRef,
      transitionToActive,
      wasActiveBeforeLockRef,
    ]
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
            `An error occured in the loading of timers from async storage`,
            error
          );
        }
      }
      load();
    },
    [allTimersRef, navigation, setEditableTimers, setTimers]
  );

  return {
    options,
    backgroundTask,
    playSoundWrapper,
    stopSoundWrapper,
    updateAlertingTimers,
  };
}
