import { useCallback } from "react";

import Time from "../../components/TimersScreen/Time";
import { useRefsData } from "../../context/VoiceRecognizerContext";
import { getItemFromStorage, removeItemFromStorage } from "../../utils/helpers";
import {
  getSharedObject,
  updateSharedObject,
} from "../../utils/sharedVariables";

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
}) {
  let appStateBoxAlt;
  const { setTimersHistory } = useRefsData();

  const loadTimerState = useCallback(async function loadTimerState() {
    try {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      appStateBoxAlt = "activeAfterBackground";

      const savedTime = await getItemFromStorage(`timerStarted-${name}`);

      const parsedTimerState = await getItemFromStorage(`timerState-${name}`);

      const parsedHistory = await getItemFromStorage("timerHistory");
      // const parsedHistory = await removeItemFromStorage("timerHistory");

      if (parsedHistory) {
        setTimersHistory(parsedHistory);
        updateSharedObject({ timers: parsedHistory });
      }

      if (savedTime) {
        const now = Date.now();

        const elapsed =
          savedTime?.timePaused > 0
            ? Math.floor(savedTime?.timePaused - savedTime.timeStarted)
            : now - savedTime.timeStarted;
        const elapsedSeconds = Math.floor(elapsed / 1000);

        const remainingTime = Math.floor(time - elapsedSeconds);

        if (remainingTime < 0) {
          return;
        }
      }

      if (
        parsedTimerState?.timerState === "running" &&
        parsedTimerState?.name === name
      ) {
        clearTimeout(getSharedObject()[`timeoutId-${name}`]);
        clearTimeout(getSharedObject()[`timeoutId-${name}`]);

        if (
          !getSharedObject().alertingTimerNames.find(
            (timerName) => timerName.toLowerCase() === name.toLowerCase(),
          )
        ) {
          console.log(`The timer ${name} is running`);
          setIsActive(true);
          setIsPaused(false);
        }
      }

      if (
        parsedTimerState?.timerState === "paused" &&
        parsedTimerState?.name === name
      ) {
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

          removeItemFromStorage(`background-${name}`);

          timerIsActiveRef.current = true;
        }

        const elapsedSeconds = Math.floor(elapsed / 1000);

        const remainingTime = Math.floor(time - elapsedSeconds);

        console.log(Date.now(), "in useLoadTimerState");

        Time[`setTimeLeft-${name}`](remainingTime);
        timeLeftRef.current = remainingTime;

        if (timerStateRef.current === "running") {
          clearTimeout(getSharedObject()[`timeoutId-${name}`]);

          resumeTimerRef.current(storageTime.timeStarted);

          timerIsActiveRef.current = true;
        }
      } catch (error) {
        console.error(`An error occurred 🚗`, error);
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
    ],
  );

  return {
    loadTimerState,
  };
}
