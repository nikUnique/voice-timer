import { useCallback, useEffect } from "react";

import { emitter } from "../utils/EventEmitter";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import BackgroundService from "react-native-background-actions";

import { AppState } from "react-native";
import { setItemInStorage } from "../utils/helpers";

import { useUpdateLeastTimer } from "./useUpdateLeastTimer";
import { useUpdateTimers } from "./useUpdateTimers";
import { useUpdateControlButtons } from "./useUpdateControlButtons";

export function usePauseResume({
  timerStartedRef,
  setIsPaused,
  timerStateRef,
  isPausedRef,
  pausedTimeRef,
  name,
  updateTimerLabel,
  timeLabelRef,
  time,
  index,
  timeLeftRef,
  updateTime,
  resumeTimerRef,
  pauseTimerRef,
  timeoutRef,
  updatePersitentNotification,
  pauseListener,
  activateTimerRef,
  isActive,
  isPaused,
}) {
  const { updateLeastTimer } = useUpdateLeastTimer({
    name,
    timeLeftRef,
    isPausedRef,
  });

  const { updateControlButtons } = useUpdateControlButtons({
    isActive,
    isPaused,
  });

  const { updateTimers } = useUpdateTimers();

  const resumeTimer = useCallback(
    async function (reopenedTimer) {
      try {
        if (reopenedTimer) {
          timerStartedRef.current = reopenedTimer;
        }

        setIsPaused(false);
        updateControlButtons(true, false);
        timerStateRef.current = "running";
        isPausedRef.current = false;
        pausedTimeRef.current = null;

        updateSharedObject({
          pausedTimers: getSharedObject().pausedTimers.filter(
            (timerName) => timerName !== name
          ),
          runningTimers: [
            ...new Set([...getSharedObject().runningTimers, name]),
          ],
        });

        if (
          getSharedObject().runningTimers.length > 0 &&
          !BackgroundService.isRunning()
        ) {
          emitter.emit("startForegroundService");
        }

        setItemInStorage(`timerState-${name}`, {
          timerState: timerStateRef.current,
          name: name,
        });

        updateTimers({ name, timerState: timerStateRef.current });

        await updateLeastTimer();
        updateTimerLabel(true);

        if (!AppState.currentState?.includes("active")) {
          emitter.emit(`updateNotification-${name}`, {
            title: timeLabelRef.current,
            body: getSharedObject().timersLabel,
            fromWhom: "resumeTimer",
          });
        }

        if (!reopenedTimer) {
          timerStartedRef.current =
            Date.now() - (time - timeLeftRef.current) * 1000; // Adjust start time
        }

        // console.log("We are resuming now", reopenedTimer, name);
        await updateTime("yes");
      } catch (err) {
        console.error("An error occured ⛑️", err);
      }
    },
    [
      setIsPaused,
      updateControlButtons,
      timerStateRef,
      isPausedRef,
      pausedTimeRef,
      name,
      updateTimers,
      updateLeastTimer,
      updateTimerLabel,
      updateTime,
      timerStartedRef,
      timeLabelRef,
      time,
      timeLeftRef,
    ]
  );

  const pauseTimer = useCallback(
    async function () {
      try {
        // console.log("I am pausing now :)", timeoutRef.current);

        setIsPaused(true);

        updateControlButtons(isActive, true);
        isPausedRef.current = true;
        pausedTimeRef.current = Date.now();
        timerStateRef.current = "paused";

        setItemInStorage(`timerState-${name}`, {
          timerState: timerStateRef.current,
          name: name,
        });

        setItemInStorage(`timerStarted-${name}`, {
          timeStarted: timerStartedRef.current,
          name: name,
          timePaused:
            pausedTimeRef.current > 0 ? pausedTimeRef.current : Date.now(),
        });
        updateTimers({
          name,
          timerState: timerStateRef.current,
          timeStarted: timerStartedRef.current,
          timePaused:
            pausedTimeRef.current > 0 ? pausedTimeRef.current : Date.now(),
        });

        await updateLeastTimer();
        updateTimerLabel();

        clearTimeout(timeoutRef.current);
        clearTimeout(getSharedObject()[`timeoutId-${name}`]);
        // console.log(
        //   "Timeout is cleared!",
        //   timeoutRef.current,
        //   getSharedObject()[`timeoutId-${name}`]
        // );

        setTimeout(function () {
          clearTimeout(timeoutRef.current);
          // getSharedObject()[`timeoutId-${name}`];
          timeoutRef.current = null;
        }, 100);

        emitter.emit(`pause-${name}`);
        updateSharedObject({
          delay: 10,
          runningTimers: getSharedObject().runningTimers.filter(
            (timerName) => timerName !== name
          ),
          pausedTimers: [...getSharedObject().pausedTimers, name],
        });

        if (getSharedObject().runningTimers.length === 0) {
          BackgroundService.stop();
        }

        emitter.all.delete(`updateNotification-${name}`);
        emitter.on(`updateNotification-${name}`, updatePersitentNotification);

        if (
          !getSharedObject().appStateBox?.includes("active") &&
          timeLeftRef.current > 0
        ) {
          emitter.emit(`updateNotification-${name}`, {
            title: timeLabelRef.current,
            body: getSharedObject().timersLabel,
            fromWhom: "pauseTimer",
          });
        }
      } catch (err) {
        console.error("An error occured in pauseTimer function:" + err + "💣");
      }
    },
    [
      timeoutRef,
      setIsPaused,
      updateControlButtons,
      isActive,
      isPausedRef,
      pausedTimeRef,
      timerStateRef,
      name,
      timerStartedRef,
      updateTimers,
      updateLeastTimer,
      updateTimerLabel,
      updatePersitentNotification,
      timeLeftRef,
      timeLabelRef,
    ]
  );

  useEffect(
    function () {
      resumeTimerRef.current = resumeTimer;
      pauseTimerRef.current = pauseTimer;

      emitter.all.delete(`pause-${name}`);
      emitter.on(`pause-${name}`, pauseListener);

      emitter.all.delete(`pauseBackground-${name}`);
      emitter.on(`pauseBackground-${name}`, pauseTimerRef.current);

      emitter.all.delete(`resumeBackground-${name}`);
      emitter.on(`resumeBackground-${name}`, resumeTimerRef.current);
    },
    [
      resumeTimer,
      resumeTimerRef,
      pauseTimer,
      pauseTimerRef,
      name,
      pauseListener,
    ]
  );
}
