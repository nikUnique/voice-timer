import { useCallback } from "react";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { updateSharedObject } from "../utils/sharedVariables";

export function useUpdateLeastTimer({
  name,
  timeLeftRef,
  isPausedRef,
  timerStartedRef,
  index,
}) {
  const { timersTimesRef, leastTimeTimerRef } = useRefsData();

  const updateLeastTimer = useCallback(
    async function () {
      try {
        let pausedRunningTimers, allTimers;

        const newTimer = {
          timerName: name,
          timeLeft: timeLeftRef.current,
          isPaused: isPausedRef.current,
          timerStarted: timerStartedRef?.current,
          index,
        };

        if (timeLeftRef.current < -1) {
          console.log("This timer is already off 🦊");
          return;
        }

        if (timersTimesRef.current?.length) {
          const alreadyAddedTimer = timersTimesRef.current?.find(
            (timer) => timer?.timerName === name
          );

          if (!alreadyAddedTimer) {
            allTimers = [...timersTimesRef.current, newTimer];
          }

          if (alreadyAddedTimer) {
            const updatedProps = {
              timeLeft: timeLeftRef.current,
              isPaused: isPausedRef.current,
              ...(index && { index }),
            };
            allTimers = timersTimesRef.current.map((timer) => {
              return timer?.timerName === name
                ? { ...timer, ...updatedProps }
                : timer;
            });
          }

          const onlyRunningTimers = allTimers.filter(
            (timer) => timer.isPaused !== true
          );

          const onlyPausedTimers = allTimers.filter(
            (timer) => timer.isPaused === true
          );

          timersTimesRef.current = [...onlyRunningTimers, ...onlyPausedTimers];

          pausedRunningTimers = onlyRunningTimers?.length
            ? onlyRunningTimers
            : onlyPausedTimers;
        }

        if (timersTimesRef.current?.length === 0) {
          timersTimesRef.current = [newTimer];
          pausedRunningTimers = timersTimesRef?.current;
        }

        leastTimeTimerRef.current = pausedRunningTimers
          .filter((timer) => timer.timeLeft >= 0)
          .slice()
          .sort((a, b) => b?.timerStarted - a?.timerStarted)
          .reduce((min, number) => {
            return number.timeLeft < min.timeLeft ? number : min;
          }, timersTimesRef?.current[0]);

        timersTimesRef.current = timersTimesRef.current.filter(
          (timer) => timer.timeLeft > 0
        );

        updateSharedObject({ leastTimer: leastTimeTimerRef.current });
        return leastTimeTimerRef.current;
      } catch (err) {
        console.error("An error occured in updateLeastTimer function ❌", err);
      }
    },
    [
      name,
      timeLeftRef,
      isPausedRef,
      timerStartedRef,
      index,
      timersTimesRef,
      leastTimeTimerRef,
    ]
  );

  return { updateLeastTimer };
}
