import { useCallback } from "react";

import Time from "../components/Time";
import { getItemFromStorage, removeItemFromStorage } from "../utils/helpers";
import { getSharedObject } from "../utils/sharedVariables";
import { useRefsData } from "../context/VoiceRecognizerContext";

export function useLoadTimerState({
  setIsActive,
  setIsPaused,
  timerStateRef,
  timerStartedRef,
  name,
  resumeTimerRef,
  handleReadyState,
  timeLeftRef,
  time,
  pausedTimeRef,
  timerIsActiveRef,
  setAppState,
}) {
  let appStateBoxAlt;
  const { workingTimersRef } = useRefsData();

  const loadTimerState = useCallback(async function loadTimerState() {
    try {
      appStateBoxAlt = "activeAfterBackground";
      setAppState("active");

      const savedTime = await getItemFromStorage(`timerStarted-${name}`);

      const parsedTimerState = await getItemFromStorage(`timerState-${name}`);

      if (savedTime) {
        const now = Date.now();

        const elapsed =
          savedTime?.timePaused > 0
            ? Math.floor(savedTime?.timePaused - savedTime.timeStarted)
            : now - savedTime.timeStarted;
        const elapsedSeconds = Math.floor(elapsed / 1000);

        const remainingTime = Math.floor(time - elapsedSeconds);

        if (remainingTime < 0) {
          console.log("Time is already less then 0 ⏲️");
          return;
        }
      }

      if (!savedTime) {
        workingTimersRef.current = workingTimersRef.current.filter(
          (workingTimer) => workingTimer !== name
        );
        // console.log("We should clean", name, workingTimersRef.current);
      }

      if (
        parsedTimerState?.timerState === "running" &&
        parsedTimerState?.name === name
      ) {
        clearTimeout(getSharedObject()[`timeoutId-${name}`]);
        clearTimeout(getSharedObject()[`timeoutId-${name}`]);

        console.log(`The timer ${name} is running`);
        setIsActive(true);
        setIsPaused(false);
      }

      if (
        parsedTimerState?.timerState === "paused" &&
        parsedTimerState?.name === name
      ) {
        console.log("This should be paused right heres");
        setIsActive(true);
        setIsPaused(true);
      }

      if (parsedTimerState?.name === name) {
        timerStateRef.current = parsedTimerState?.timerState;
      }

      if (savedTime?.timeStarted) {
        await loadTime(savedTime);
      }

      handleReadyState();

      return appStateBoxAlt;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadTime = useCallback(
    async function loadTime(storageTime) {
      try {
        if (storageTime?.name !== name) {
          return;
        }

        const now = Date.now();

        const elapsed =
          storageTime.timePaused > 0
            ? Math.floor(storageTime.timePaused - storageTime.timeStarted)
            : now - storageTime.timeStarted;

        if (timerStateRef.current === "paused") {
          timerStartedRef.current = storageTime.timeStarted;

          pausedTimeRef.current = storageTime.timePaused;

          console.log("Timer was actually paused :)");

          /* await */ removeItemFromStorage(`background-${name}`);

          timerIsActiveRef.current = true;
        }

        const elapsedSeconds = Math.floor(elapsed / 1000);

        const remainingTime = Math.floor(time - elapsedSeconds);

        Time[`setTimeLeft-${name}`](remainingTime);
        timeLeftRef.current = remainingTime;

        // Paused here
        if (timerStateRef.current === "running") {
          // console.log(
          //   "Timeout cleared",
          //   getSharedObject()[`timeoutId-${name}`]
          // );

          clearTimeout(getSharedObject()[`timeoutId-${name}`]);

          resumeTimerRef.current(storageTime.timeStarted);

          timerIsActiveRef.current = true;
        }
      } catch (error) {
        console.error(`An error occured 🚗`, error);
      }
    },
    [
      name,
      pausedTimeRef,
      resumeTimerRef,
      time,
      timeLeftRef,
      timerIsActiveRef,
      timerStartedRef,
      timerStateRef,
    ]
  );

  return {
    loadTimerState,
  };
}
