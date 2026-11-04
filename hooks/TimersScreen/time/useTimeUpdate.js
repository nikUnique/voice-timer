import notifee from "@notifee/react-native";
import { NativeEventEmitter, NativeModules } from "react-native";
import { useCallback, useEffect, useRef } from "react";

import Time from "../../../components/TimersScreen/Time";
import {
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { emitter } from "../../../utils/EventEmitter";
import { setItemInStorage } from "../../../utils/helpers";
import {
  getSharedObject,
  updateSharedObject,
} from "../../../utils/sharedVariables";
import { useTimeUpdateFunctions } from "./useTimeUpdateFunctions";

const TimerTickModule = NativeModules.TimerTick;
const tickEmitter = TimerTickModule
  ? new NativeEventEmitter(TimerTickModule)
  : null;

export function useTimeUpdate({
  timeLeftRef,
  isPausedRef,
  timerStartedRef,
  time,
  name,
  updateLeastTimer,
  updateTimerLabel,
  timeLabelRef,
  timeoutRef,
  isActive,
  isPaused,
}) {
  const updateTimeCallbackRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const pendingTickRef = useRef(false);
  const {
    leastTimeTimerRef,
    setIsAlarmingScreen,
    alertingTimerNamesRef,
    setAlertingTimerNames,
    timersTimesRef,
    setTimersHistory,
  } = useRefsData();

  const { alertSound, autoStopAlarmTimeout, alarmVolume, isVibrating } =
    useSettingsData();

  const { assignAlertingTimersNames } = useTimeUpdateFunctions(
    name,
    setAlertingTimerNames,
  );

  const sendNotification = useCallback(
    async function () {
      leastTimeTimerRef.current = {
        ...leastTimeTimerRef.current,
        timeLeft: timeLeftRef.current,
      };

      emitter.emit(`updateNotification-${name}`, {
        title: timeLabelRef.current,
        body: getSharedObject()?.timersLabel,
        time: timeLeftRef.current,
        fromWhom: "updateTime",
      });
    },
    [leastTimeTimerRef, name, timeLabelRef, timeLeftRef],
  );

  const prepareForAlarm = useCallback(
    async function () {
      await assignAlertingTimersNames();

      setAlertingTimerNames(alertingTimerNamesRef.current);

      if (alertingTimerNamesRef.current?.length > 0) {
        notifee.cancelDisplayedNotification("92901");
      }

      const updatableTimer = getSharedObject().timers.find((timer) => {
        return (
          timer?.label.toLowerCase() === name.toLowerCase() && !timer?.endTime
        );
      });
      updateSharedObject({
        timers: getSharedObject().timers.map((timer) => {
          return timer?.label === updatableTimer?.label && !timer?.endTime
            ? {
                ...updatableTimer,
                duration: time - timeLeftRef.current,
                endTime: new Date(),
              }
            : timer;
        }),

        runningTimerNames: getSharedObject().runningTimerNames.filter(
          (timerName) =>
            timerName.toLowerCase().trim() !== name.toLowerCase().trim(),
        ),
      });

      setTimersHistory((cur) =>
        cur.map((timer) => {
          return timer?.label === updatableTimer?.label && !timer?.endTime
            ? {
                ...updatableTimer,
                duration: time - timeLeftRef.current,
                endTime: new Date(),
              }
            : timer;
        }),
      );

      setItemInStorage("timerHistory", getSharedObject().timers);

      const playingObject = {
        fileName: alertSound,
        isLooping: true,
        volume: alarmVolume,
        duration: autoStopAlarmTimeout,
        isVibrating,
      };

      emitter.emit("playSound", playingObject);
      await updateLeastTimer();
      updateTimerLabel();
      await sendNotification();
    },
    [
      assignAlertingTimersNames,
      setAlertingTimerNames,
      alertingTimerNamesRef,
      setTimersHistory,
      alertSound,
      alarmVolume,
      autoStopAlarmTimeout,
      isVibrating,
      updateLeastTimer,
      updateTimerLabel,
      sendNotification,
      name,
      time,
      timeLeftRef,
    ],
  );

  const calculateLeftTime = useCallback(
    async function () {
      const now = Date.now();
      const elapsed = now - timerStartedRef.current;
      const elapsedSeconds = Math.floor(elapsed / 1000);

      const remainingTime = Math.floor(time - elapsedSeconds);

      timeLeftRef.current = remainingTime;
      console.log(`New time comes-${name}`, timeLeftRef.current);
      console.log(Date.now(), "in useTimeUpdate");

      const key = `setTimeLeft-${name}`;
      const setTimeLeft = Time?.[key];

      if (typeof setTimeLeft === "function") {
        setTimeLeft(timeLeftRef.current);
      } else {
        requestAnimationFrame(() => {
          const setTimeLeft = Time?.[key];

          if (typeof setTimeLeft === "function") {
            setTimeLeft(timeLeftRef.current);
          }
        });
      }
    },
    [name, time, timeLeftRef, timerStartedRef],
  );

  const updateDelayAndLeastTimer = useCallback(
    async function () {
      if (timeLeftRef.current <= 0) {
        // Necessary in the end
        leastTimeTimerRef.current = await updateLeastTimer();

        timersTimesRef.current = timersTimesRef.current.filter(
          (timer) => timer.timerName !== name,
        );
      }
    },
    [leastTimeTimerRef, name, timeLeftRef, timersTimesRef, updateLeastTimer],
  );

  const updateTime = useCallback(
    async function () {
      try {
        if (getSharedObject().alertingTimerNames?.includes(name)) {
          console.log(`This timer is already finished 🪃`, name);

          return;
        }

        await calculateLeftTime();

        if (isPausedRef.current) {
          console.log("The timer is paused 🧋");
          return;
        }

        if (timeLeftRef.current <= -5 || isPausedRef.current) {
          console.log("Time is zero or less or the timer is paused");

          return;
        }

        await updateDelayAndLeastTimer();

        if (timeLeftRef.current <= 0 && timeLeftRef.current >= -5) {
          if (alertingTimerNamesRef.current.includes(name)) {
            return;
          }

          if (!alertingTimerNamesRef.current.includes(name)) {
            await prepareForAlarm();
          }
        }

        const isLeastTimeTimer = leastTimeTimerRef.current?.timerName === name;

        if (timeLeftRef.current === 0 || timeLeftRef.current === -1) {
          setIsAlarmingScreen(true);
        }

        if (
          timeLeftRef.current > 0 &&
          alertingTimerNamesRef.current?.length === 0 &&
          isLeastTimeTimer
        ) {
          await updateLeastTimer();
          updateTimerLabel();
          await sendNotification();
        }
      } catch (err) {
        console.error("An error occurred in updateTime function 🔺", err);
      }
    },
    [
      name,
      calculateLeftTime,
      isPausedRef,
      timeLeftRef,
      updateDelayAndLeastTimer,
      leastTimeTimerRef,
      alertingTimerNamesRef,
      prepareForAlarm,
      setIsAlarmingScreen,
      updateLeastTimer,
      updateTimerLabel,
      sendNotification,
    ],
  );

  useEffect(
    function () {
      updateTimeCallbackRef.current = updateTime;
    },
    [updateTime],
  );

  // Manage native ticker lifecycle on mount/unmount only. Transitions
  // (start/pause/resume/reset) are driven imperatively by the action
  // functions so they work even when React effects do not commit while
  // the app is backgrounded. Reference counting in the native module
  // handles multiple concurrent timers.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    function () {
      let started = false;
      if (isActive && !isPaused && TimerTickModule) {
        TimerTickModule.startTicking();
        started = true;
      }
      return function () {
        if (started && TimerTickModule) {
          TimerTickModule.stopTicking();
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Subscribe to native "TimerTick" events. Uses updateTimeCallbackRef so it
  // always calls the latest updateTime without re-subscribing.
  // Missed ticks (when an update is still in progress) are queued (latest-wins)
  // so no second is lost and the display stays precise.
  useEffect(
    function () {
      if (!tickEmitter) return;

      const subscription = tickEmitter.addListener("TimerTick", function () {
        if (!timerStartedRef.current) return;
        if (isPausedRef.current) return;
        if (timeLeftRef.current <= 0) return;

        if (isUpdatingRef.current) {
          pendingTickRef.current = true;
          return;
        }

        isUpdatingRef.current = true;

        function runUpdate() {
          const fn = updateTimeCallbackRef.current;
          if (typeof fn !== "function") {
            isUpdatingRef.current = false;
            return;
          }
          fn().finally(function () {
            if (pendingTickRef.current) {
              pendingTickRef.current = false;
              runUpdate();
            } else {
              isUpdatingRef.current = false;
            }
          });
        }

        runUpdate();
      });

      return function () {
        subscription.remove();
      };
    },
    [isPausedRef, timeLeftRef, timerStartedRef],
  );

  return { updateTime };
}
