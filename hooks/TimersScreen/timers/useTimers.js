/* eslint-disable no-constant-condition */
import notifee from "@notifee/react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, NativeModules, PermissionsAndroid } from "react-native";

import {
  useRecognizerData,
  useRefsData,
} from "../../../context/VoiceRecognizerContext";
import {
  getItemFromStorage,
  setItemInStorage,
  sleep,
} from "../../../utils/helpers";

import { useNavigation } from "@react-navigation/native";
import { getSharedObject } from "../../../utils/sharedVariables";
import { useSettings } from "../../SettingsScreen/useSettings";
import { useSound } from "../../shared/useSound";
import { BACKGROUND_DELAY } from "../../../utils/config";

export function useTimers() {
  const navigation = useNavigation();
  const [isMicroGranted, setIsMicroGranted] = useState(false);
  const { playSound, stopSound } = useSound();
  const { setTimers, setEditableTimers } = useRecognizerData();

  const {
    notificationIdRef,
    isFullScreenNotificationRef,
    appStateRef,
    wasActiveBeforeLockRef,
    previousLockedRef,
    alertingTimerNamesRef,
    allTimersRef,
  } = useRefsData();

  useSettings();

  useEffect(
    function () {
      async function load() {
        const microGranted = await PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
        setIsMicroGranted(microGranted);
      }
      load();
    },
    [isMicroGranted],
  );

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
      foregroundServiceType: /* isMicroGranted
        ?  */ ["specialUse", "microphone"],
      /*  : ["specialUse"] */
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

        await sleep(BACKGROUND_DELAY);
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
