import { useCallback, useEffect } from "react";
import { AppState, Platform } from "react-native";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { emitter } from "../utils/EventEmitter";
import { setItemInStorage } from "../utils/helpers";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import { useUpdateControlButtons } from "./useUpdateControlButtons";

export function useStartTimer({
  isActive,
  timeLeftRef,
  setIsActive,
  setIsReset,
  setIsPaused,
  timerIsActiveRef,
  timerStartedRef,
  soundIsPlayedRef,
  isPausedRef,
  startNewTimerRef,
  activateTimerRef,
  pauseTimerRef,
  resumeTimerRef,
  timerStateRef,
  time,
  name,
  index,
  updateLeastTimer,
  updatePersitentNotification,
  updateTimerLabel,
  pauseListener,
  updateTime,
  isPaused,
}) {
  const { workingTimersRef, freshlyCreatedTimerRef, lastTimerStartedRef } =
    useRefsData();

  const { updateControlButtons } = useUpdateControlButtons({
    isActive,
    isPaused,
  });

  const startTimer = useCallback(
    async function (repeat) {
      try {
        if (Platform.constants.Release >= 12) {
          emitter.emit("startForegroundService");
        }

        if (!AppState.currentState.includes("active")) {
          console.log(
            "The app is already in the background 🐈‍⬛",
            AppState.currentState
          );
          return;
        }

        console.log(
          "sumba",
          isActive,
          timeLeftRef.current,
          workingTimersRef.current
        );

        if ((!isActive || repeat) && timeLeftRef.current > 0) {
          if (workingTimersRef.current.length >= 5) {
            console.log(
              "You have reached maximum of working timers at the same time :)"
            );
            return;
          }

          setIsActive(true);
          setIsReset(false);
          updateControlButtons(true, false);
          setIsPaused(false);

          timerIsActiveRef.current = true;

          if (freshlyCreatedTimerRef.current?.name === name) {
            timerStartedRef.current = lastTimerStartedRef.current;
          }

          if (freshlyCreatedTimerRef.current?.name !== name) {
            timerStartedRef.current = Date.now();
          }

          timeLeftRef.current = time;
          soundIsPlayedRef.current = false;
          isPausedRef.current = false;
          timerStateRef.current = "running";
          updateSharedObject({
            appStateBox: "active",
            runningTimers: [...getSharedObject().runningTimers, name],
          });

          if (!workingTimersRef.current?.includes(name)) {
            workingTimersRef.current = [...workingTimersRef.current, name];
          }

          updateLeastTimer();
          updateTimerLabel(true);

          emitter.all.delete(`pause-${name}`);
          emitter.on(`pause-${name}`, pauseListener);

          emitter.all.delete(`updateNotification-${name}`);
          emitter.on(`updateNotification-${name}`, updatePersitentNotification);

          emitter.all.delete(`pauseBackground-${name}`);
          emitter.on(`pauseBackground-${name}`, pauseTimerRef.current);

          emitter.all.delete(`resumeBackground-${name}`);
          emitter.on(`resumeBackground-${name}`, resumeTimerRef.current);

          setItemInStorage("workingTimers", workingTimersRef.current);

          startNewTimerRef.current = true;

          await updateTime();

          setTimeout(function () {
            setItemInStorage(`timerState-${name}`, {
              timerState: timerStateRef.current,
              name: name,
            });

            setItemInStorage(`timerStarted-${name}`, {
              timeStarted: timerStartedRef.current,
              name: name,
              timePaused: null,
            });
          }, 1000);

          activateTimerRef.current(index);
        }
      } catch (error) {
        console.error(`An error happened in the startTimer function 🤩`, error);
      }
    },
    [
      isActive,
      timeLeftRef,
      workingTimersRef,
      setIsActive,
      setIsReset,
      updateControlButtons,
      setIsPaused,
      timerIsActiveRef,
      freshlyCreatedTimerRef,
      name,
      time,
      soundIsPlayedRef,
      isPausedRef,
      timerStateRef,
      updateLeastTimer,
      updateTimerLabel,
      pauseListener,
      updatePersitentNotification,
      pauseTimerRef,
      resumeTimerRef,
      startNewTimerRef,
      updateTime,
      activateTimerRef,
      index,
      timerStartedRef,
      lastTimerStartedRef,
    ]
  );

  useEffect(
    function () {
      async function load() {
        if (
          Date.now() - freshlyCreatedTimerRef.current?.createdAt < 3000 &&
          name === freshlyCreatedTimerRef.current?.name
        ) {
          // console.log(
          //   "time gap",
          //   Date.now() - freshlyCreatedTimerRef.current?.createdAt
          // );

          // freshlyCreatedTimerRef.current = null;
          // setTimeout(async function () {
          // }, 800)
          startTimer();
          freshlyCreatedTimerRef.current = null;
        }
      }

      load();
    },
    [freshlyCreatedTimerRef, name, startTimer]
  );

  return { startTimer };
}
