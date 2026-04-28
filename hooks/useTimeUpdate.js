import notifee from "@notifee/react-native";
import { useCallback, useEffect, useRef } from "react";
import { NativeModules } from "react-native";
import BackgroundService from "react-native-background-actions";

import Time from "../components/Time";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { emitter } from "../utils/EventEmitter";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

import { setItemInStorage } from "../utils/helpers";
import { useTimeUpdateFunctions } from "./useTimeUpdateFunctions";

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
}) {
  const updateTimeCallbackRef = useRef(null);
  const {
    leastTimeTimerRef,
    setIsAlarmingScreen,
    alertingTimerNamesRef,
    setAlertingTimerNames,
    notificationIdRef,
    timersTimesRef,
    workingTimersRef,
    setTimersHistory,
  } = useRefsData();
  // const routes = useNavigationState((state) => state.routes);

  const { alertSound, autoStopAlarmTimeout, alarmVolume, isVibrating } =
    useSettingsData();

  let isPhoneLocked;

  const { assignAlertingTimersNames } = useTimeUpdateFunctions(
    name,
    setAlertingTimerNames,
  );

  const prepareForAlarm = useCallback(
    async function () {
      await assignAlertingTimersNames();

      setAlertingTimerNames(alertingTimerNamesRef.current);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      isPhoneLocked = await NativeModules.NativeUtilsModule.isPhoneLocked();

      // console.log("should play", name, alarmVolume);

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
      });
      setTimersHistory((cur) =>
        cur.map((timer) => {
          console.log(timer.duration + "🈂️" + "timeUpdate");
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

      // console.log("Ended", Date.now(), Date.now() - timerStartedRef.current);

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
      name,
      alertingTimerNamesRef,
      alarmVolume,
      setAlertingTimerNames,
      autoStopAlarmTimeout,
      isVibrating,
    ],
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

  const calculateLeftTime = useCallback(
    async function () {
      const now = Date.now();
      const elapsed = now - timerStartedRef.current;
      const elapsedSeconds = Math.floor(elapsed / 1000);

      const remainingTime = Math.floor(time - elapsedSeconds);

      timeLeftRef.current = remainingTime;
      console.log(`New time comes-${name}`, timeLeftRef.current);
      Time[`setTimeLeft-${name}`](timeLeftRef.current);
    },
    [name, time, timeLeftRef, timerStartedRef],
  );

  const updateDelayAndLeastTimer = useCallback(
    async function () {
      if (timeLeftRef.current <= 0) {
        updateSharedObject({ delay: 10 });

        // Necessary in the end
        leastTimeTimerRef.current = await updateLeastTimer();

        timersTimesRef.current = timersTimesRef.current.filter(
          (timer) => timer.timerName !== name,
        );
      }

      if (timeLeftRef.current <= 10) {
        updateSharedObject({ delay: 1 });
      }

      if (timeLeftRef.current > 0 && timeLeftRef.current % 60 < 10) {
        const newDelay = Math.ceil(timeLeftRef.current % 60) || 1;
        updateSharedObject({ delay: newDelay });
      }

      if (timeLeftRef.current % 60 >= 10) {
        updateSharedObject({ delay: 1 });
      }

      // if (!leastTimeTimerRef.current) {
      //   await updateLeastTimer();
      // }
    },
    [leastTimeTimerRef, name, timeLeftRef, timersTimesRef, updateLeastTimer],
  );

  const updateTime = useCallback(
    async function () {
      try {
        if (getSharedObject().alertingTimerNames?.includes(name)) {
          console.log(`This timer is alredy finished 🪃`, name);

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
            // console.log(
            //   "This already played the sound",
            //   alertingTimerNamesRef.current
            // );
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

        if (
          !workingTimersRef.current?.length &&
          !alertingTimerNamesRef.current?.length
        ) {
          console.log("Background service stops...");

          updateSharedObject({ isTaskRunning: false });
          BackgroundService?.stop();
        }

        clearTimeout(timeoutRef.current);

        let improvedTime;

        if (
          Date.now().toString().slice(-3) >
          timerStartedRef.current.toString().slice(-3)
        ) {
          improvedTime = Math.abs(
            Date.now().toString().slice(-3) -
              timerStartedRef.current.toString().slice(-3),
          );
        }

        if (
          Date.now().toString().slice(-3) <
          timerStartedRef.current.toString().slice(-3)
        ) {
          const leftOverUntill1000 =
            1000 - timerStartedRef.current.toString().slice(-3);

          improvedTime = +Date.now().toString().slice(-3) + +leftOverUntill1000;
        }

        if (timeLeftRef.current > 0) {
          timeoutRef.current = setTimeout(
            /* updateTime */ updateTimeCallbackRef.current,
            1000 - improvedTime,
          );
          updateSharedObject({ [`timeoutId-${name}`]: timeoutRef.current });
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
      workingTimersRef,
      alertingTimerNamesRef,
      timeoutRef,
      timerStartedRef,
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

  return { updateTime };
}
