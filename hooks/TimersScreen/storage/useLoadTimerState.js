import { useCallback } from "react";

import Time from "../../../components/TimersScreen/Time";
import { useRefsData } from "../../../context/VoiceRecognizerContext";
import {
  getItemFromStorage,
  removeItemFromStorage,
  setItemInStorage,
} from "../../../utils/helpers";
import {
  getSharedObject,
  updateSharedObject,
} from "../../../utils/sharedVariables";

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
  const { setTimersHistory, alertingTimerNamesRef, setAlertingTimerNames } =
    useRefsData();

  // Declared before loadTimerState: it calls loadTime, and referencing a
  // const before its declaration would throw (TDZ).
  const loadTime = useCallback(
    async function loadTime(storageTime, currentName, currentTime) {
      try {
        if (storageTime?.name !== currentName) {
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

          removeItemFromStorage(`background-${currentName}`);

          timerIsActiveRef.current = true;
        }

        const elapsedSeconds = Math.floor(elapsed / 1000);

        const remainingTime = Math.floor(currentTime - elapsedSeconds);

        Time[`setTimeLeft-${currentName}`](remainingTime);
        timeLeftRef.current = remainingTime;

        if (timerStateRef.current === "running") {
          clearTimeout(getSharedObject()[`timeoutId-${currentName}`]);

          resumeTimerRef.current(storageTime.timeStarted);

          timerIsActiveRef.current = true;
        }
      } catch (error) {
        console.error(`An error occurred 🚗`, error);
      }
    },
    [
      pausedTimeRef,
      resumeTimerRef,
      timeLeftRef,
      timerIsActiveRef,
      timerStartedRef,
      timerStateRef,
    ],
  );

  const loadTimerState = useCallback(
    async function loadTimerState(currentName, currentTime) {
      try {
        const savedTime = await getItemFromStorage(
          `timerStarted-${currentName}`,
        );

        const parsedTimerState = await getItemFromStorage(
          `timerState-${currentName}`,
        );

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

          const remainingTime = Math.floor(currentTime - elapsedSeconds);

          if (remainingTime < 0) {
            // The timer already expired while the app window was closed.
            // updateTime can't rescue this (it bails once a timer is more
            // than ~5s past zero), so we enter the alerting state directly
            // here — this drives the alarm overlay via the existing
            // alertingTimerNames navigation effect, mirroring
            // assignAlertingTimersNames from the live-expiry path.
            const alreadyAlerting = alertingTimerNamesRef.current.some(
              (timerName) =>
                timerName.toLowerCase().trim() ===
                currentName.toLowerCase().trim(),
            );

            if (!alreadyAlerting) {
              alertingTimerNamesRef.current = [
                ...new Set([...alertingTimerNamesRef.current, currentName]),
              ];

              if (getSharedObject().alertingTimerNames?.length) {
                updateSharedObject({
                  alertingTimerNames: [
                    ...new Set([
                      ...alertingTimerNamesRef.current,
                      ...getSharedObject().alertingTimerNames,
                    ]),
                  ],
                });
              } else {
                updateSharedObject({
                  alertingTimerNames: [
                    ...new Set([...alertingTimerNamesRef.current]),
                  ],
                });
              }

              setAlertingTimerNames(alertingTimerNamesRef.current);
              setItemInStorage(
                "alertingTimerNames",
                alertingTimerNamesRef.current,
              );
            }

            setIsActive(true);
            setIsPaused(false);
            Time[`setTimeLeft-${currentName}`](0);
            timeLeftRef.current = 0;

            handleReadyState();
            return;
          }
        }

        if (
          parsedTimerState?.timerState === "running" &&
          parsedTimerState?.name === currentName
        ) {
          clearTimeout(getSharedObject()[`timeoutId-${currentName}`]);
          clearTimeout(getSharedObject()[`timeoutId-${currentName}`]);

          if (
            !getSharedObject().alertingTimerNames.find(
              (timerName) =>
                timerName.toLowerCase() === currentName.toLowerCase(),
            )
          ) {
            console.log(`The timer ${currentName} is running`);
            setIsActive(true);
            setIsPaused(false);
          }
        }

        if (
          parsedTimerState?.timerState === "paused" &&
          parsedTimerState?.name === currentName
        ) {
          setIsActive(true);
          setIsPaused(true);
        }

        if (parsedTimerState?.name === currentName) {
          timerStateRef.current = parsedTimerState?.timerState;
        }

        if (savedTime?.timeStarted) {
          await loadTime(savedTime, currentName, currentTime);
        }

        handleReadyState();
      } catch (err) {
        console.error(err);
      }
    },
    [
      handleReadyState,
      loadTime,
      setIsActive,
      setIsPaused,
      setTimersHistory,
      setAlertingTimerNames,
      alertingTimerNamesRef,
      timeLeftRef,
      timerStateRef,
    ],
  );

  return {
    loadTimerState,
  };
}
