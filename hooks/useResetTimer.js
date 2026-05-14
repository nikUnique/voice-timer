import notifee from "@notifee/react-native";
import { useCallback, useEffect } from "react";
import { AppState, BackHandler, NativeModules } from "react-native";

import Time from "../components/Time";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { emitter, resetTimerEmitter } from "../utils/EventEmitter";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

import {
  removeItemFromStorage,
  setItemInStorage,
  sleep,
} from "../utils/helpers";
import { useNotification } from "./useNotification";
import { useUpdateControlButtons } from "./useUpdateControlButtons";
import { useUpdateTimers } from "./useUpdateTimers";

export function useResetTimer({
  name,
  time,
  index,
  activateTimerRef,
  setIsActive,
  setIsReset,
  timeoutRef,
  timerStateRef,
  timeLeftRef,
  timerIsActiveRef,
  startNewTimerRef,
  pausedTimeRef,
  updateTimerLabel,
  resetTimerRef,
  isActive,
  isPaused,
}) {
  const {
    alertingTimerNamesRef,
    setAlertingTimerNames,
    workingTimersRef,
    setIsAlarmingScreen,
    notificationTitleRef,
    notificationBodyRef,
    timersTimesRef,
    leastTimeTimerRef,
    isFullScreenNotificationRef,
    currentActivityRef,
    wasActiveBeforeLockRef,
    ongoingNotificationLabelRef,
    setTimersHistory,
  } = useRefsData();

  const { updateControlButtons } = useUpdateControlButtons({
    isActive,
    isPaused,
  });

  const { updateTimers } = useUpdateTimers();

  const { onUpdateNotification } = useNotification();

  useEffect(
    function () {
      emitter.all.delete(`updateTimeGlobally-${name}`);
      emitter.on(`updateTimeGlobally-${name}`, () => {
        Time[`setTimeLeft-${name}`](time);
        timeLeftRef.current = time;
      });
    },
    [name, time, timeLeftRef],
  );

  const getLeastTimer = useCallback(
    function () {
      const onlyRunningTimerNames = timersTimesRef.current?.filter(
        (timer) => timer.isPaused !== true,
      );

      const onlyPausedTimerNames = timersTimesRef.current?.filter(
        (timer) => timer.isPaused === true,
      );

      const pausedRunningTimerNames = onlyRunningTimerNames.length
        ? onlyRunningTimerNames
        : onlyPausedTimerNames;

      leastTimeTimerRef.current = pausedRunningTimerNames.reduce(
        (min, number) => {
          return number.timeLeft < min.timeLeft ? number : min;
        },
        timersTimesRef.current[0],
      );
    },
    [timersTimesRef, leastTimeTimerRef],
  );

  const resetTimer = useCallback(
    async function () {
      try {
        const playingSoundTimerName = alertingTimerNamesRef.current?.find(
          (item) => item === name,
        );

        alertingTimerNamesRef.current =
          alertingTimerNamesRef.current?.filter(
            (timerName) => timerName !== playingSoundTimerName,
          ) || [];

        if (alertingTimerNamesRef.current.length === 0) {
          await notifee.cancelDisplayedNotification("ALARM_NOTIFICATION");
          // await notifee.stopForegroundService();
        }

        getSharedObject().name === name && updateControlButtons(false, false);

        const updatableTimer = getSharedObject().timers.find((timer) => {
          return (
            timer?.label?.toLowerCase() === name.toLowerCase() && !timer.endTime
          );
        });

        const localDuration = time - timeLeftRef.current;

        updateSharedObject({
          alertingTimerNames: getSharedObject().alertingTimerNames.filter(
            (timerName) =>
              timerName.toLowerCase().trim() !== name.toLowerCase().trim(),
          ),
          index: workingTimersRef.current.length === 0 && 0,
          runningTimerNames: getSharedObject().runningTimerNames.filter(
            (timerName) =>
              timerName.toLowerCase().trim() !== name.toLowerCase().trim(),
          ),
          pausedTimerNames: getSharedObject().pausedTimerNames.filter(
            (timerName) =>
              timerName.toLowerCase().trim() !== name.toLowerCase().trim(),
          ),
          timers: getSharedObject().timers.map((timer) => {
            return timer?.label.trim().toLowerCase() ===
              updatableTimer?.label.trim().toLowerCase() && !timer.endTime
              ? {
                  ...updatableTimer,
                  duration: localDuration,
                  endTime: new Date(),
                  reset: true,
                }
              : timer;
          }),
        });

        setTimersHistory((cur) =>
          cur.map((timer) => {
            return timer?.label.trim().toLowerCase() ===
              updatableTimer?.label.trim().toLowerCase() && !timer.endTime
              ? {
                  ...updatableTimer,
                  duration: localDuration,
                  endTime: new Date(),
                  reset: true,
                }
              : timer;
          }),
        );

        setItemInStorage("timerHistory", getSharedObject().timers);

        // if (getSharedObject().runningTimerNames.length === 0) {
        //   BackgroundService.stop();
        // }

        setAlertingTimerNames(alertingTimerNamesRef.current);
        setItemInStorage("alertingTimerNames", alertingTimerNamesRef.current);

        workingTimersRef.current = workingTimersRef.current?.filter(
          (timerName) => timerName !== name,
        );
        setItemInStorage("workingTimers", workingTimersRef.current);

        setIsActive(false);
        setIsReset(true);

        Time[`setTimeLeft-${name}`](time);
        timeLeftRef.current = time;

        emitter.emit(`updateTimeGlobally-${name}`);
        setIsAlarmingScreen(false);

        clearTimeout(timeoutRef?.current);
        setTimeout(function () {
          clearTimeout(timeoutRef?.current);
        }, 100);

        notificationTitleRef.current = "";
        notificationBodyRef.current = "";
        timerStateRef.current = "completed";
        timerIsActiveRef.current = false;
        startNewTimerRef.current = false;
        pausedTimeRef.current = null;

        emitter?.emit("stopSound", {
          alertingTimerNames: getSharedObject().alertingTimerNames || [],
        });

        timersTimesRef.current = timersTimesRef.current?.filter(
          (timer) => timer?.timerName !== name,
        );
        getLeastTimer();
        updateTimerLabel();

        if (workingTimersRef.current.length === 0) {
          // await notifee.stopForegroundService();
          timersTimesRef.current = [];
          leastTimeTimerRef.current = null;
          removeItemFromStorage("workingTimers");
          removeItemFromStorage("alertingTimerNames");
        }

        // if (
        //   workingTimersRef.current.length -
        //     alertingTimerNamesRef.current.length ===
        //   0
        // ) {
        //   await BackgroundService.stop();
        //   updateSharedObject({ isTaskRunning: false });
        //   // await notifee.stopForegroundService();
        // }

        await removeItemFromStorage(`timerStarted-${name}`);
        await removeItemFromStorage(`timerState-${name}`);
        updateTimers({
          name,
          timeStarted: null,
          timePaused: null,
          timerState: null,
        });

        emitter.all.delete(`updateNotification-${name}`);
        emitter.all.delete(`pause-${name}`);

        timersTimesRef.current = timersTimesRef.current?.filter(
          (timer) => timer?.timerName !== name,
        );

        if (
          workingTimersRef.current?.length > 0 &&
          alertingTimerNamesRef.current.length === 0 &&
          AppState.currentState !== "active"
        ) {
          onUpdateNotification(
            ongoingNotificationLabelRef?.current,
            getSharedObject().timersLabel,
            name,
          );
        }

        const isPhoneLocked =
          await NativeModules.NativeUtilsModule.isPhoneLocked();

        if (alertingTimerNamesRef.current.length === 0) {
          // await notifee.stopForegroundService();
          await notifee.cancelDisplayedNotification("ALARM_NOTIFICATION");
        }

        if (workingTimersRef.current?.length === 0) {
          notifee.cancelAllNotifications();
          notifee.cancelDisplayedNotifications();
          // updateSharedObject({ isTaskRunning: false });
          // BackgroundService.stop();
        }

        // This is important becuase if the app is closed then the currentActivityRef.current will be null
        if (
          isPhoneLocked &&
          currentActivityRef.current === "MainActivity" &&
          wasActiveBeforeLockRef.current === true
        ) {
          wasActiveBeforeLockRef.current = false;
          NativeModules.NativeUtilsModule.forbidShowingWhenLocked();
          return;
        }

        wasActiveBeforeLockRef.current = false;

        if (isPhoneLocked && !getSharedObject().alertingTimerNames.length) {
          // BackHandler.exitApp();
          // await sleep(1);
          NativeModules.NativeUtilsModule.pressBack();
        }
      } catch (error) {
        console.error(`An error occurred in resetTimer function ❎`, error);
      }
    },
    [
      alertingTimerNamesRef,
      name,
      updateControlButtons,
      workingTimersRef,
      setTimersHistory,
      setAlertingTimerNames,
      setIsActive,
      setIsReset,
      time,
      timeLeftRef,
      setIsAlarmingScreen,
      timeoutRef,
      notificationTitleRef,
      notificationBodyRef,
      timerStateRef,
      timerIsActiveRef,
      startNewTimerRef,
      pausedTimeRef,
      timersTimesRef,
      getLeastTimer,
      updateTimerLabel,
      updateTimers,
      currentActivityRef,
      wasActiveBeforeLockRef,
      leastTimeTimerRef,
      onUpdateNotification,
      ongoingNotificationLabelRef,
    ],
  );

  useEffect(
    function () {
      resetTimerRef.current = resetTimer;
      resetTimerEmitter.all.delete(`reset ${name}`);
      resetTimerEmitter.on(`reset ${name}`, resetTimer);
    },
    [
      resetTimer,
      name,
      resetTimerRef,
      isFullScreenNotificationRef,
      alertingTimerNamesRef,
    ],
  );

  return { resetTimer };
}
