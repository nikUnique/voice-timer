import notifee from "@notifee/react-native";
import { useCallback } from "react";
import { AppState, NativeModules } from "react-native";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

import { useNotification } from "./useNotification";

let timersLabel;

export function useUpdateNotification({
  timeoutRef,
  name,
  timeLeftRef,
  timeLabelRef,
  isPausedRef,
}) {
  const {
    leastTimeTimerRef,
    workingTimersRef,
    notificationTitleRef,
    alertingTimerNamesRef,
    ongoingNotificationLabelRef,
  } = useRefsData();

  const { onCreateTriggerNotification, onUpdateNotification } =
    useNotification();

  const pauseListener = useCallback(
    function () {
      clearTimeout(timeoutRef.current);
      setTimeout(function () {
        clearTimeout(timeoutRef.current);
      }, 100);

      isPausedRef.current = true;
      timeoutRef.current = null;
    },
    [isPausedRef, timeoutRef],
  );

  const updatePersitentNotification = useCallback(
    async function ({ title, body, time }) {
      try {
        const isAppActive = AppState.currentState === "active";

        const isTimeUp = +time <= 0 || time <= -1;

        const isPhoneLocked =
          await NativeModules.NativeUtilsModule.isPhoneLocked();

        if (/* (isPhoneLocked && isTimeUp) || */ isTimeUp) {
          let newBody = `${name} is complete.`;

          if (getSharedObject().alertingTimerNames.length > 1) {
            newBody = `${getSharedObject().alertingTimerNames.length} timers expired`;
          }

          if (isPhoneLocked) {
            NativeModules.NativeUtilsModule.permitShowingWhenLocked();
          }

          await onCreateTriggerNotification(title, newBody, name);
        }

        if (isTimeUp) return;

        if (isAppActive) return;

        const displayedNotifications =
          await notifee.getDisplayedNotifications();

        const isNotificationActive = displayedNotifications.some(
          (not) => not.id === "92901",
        );

        let canUpdateNotification =
          title && notificationTitleRef?.current !== title && !isAppActive;

        if (!canUpdateNotification) {
          canUpdateNotification = !isNotificationActive && !isAppActive;
        }

        if (canUpdateNotification) {
          await onUpdateNotification(title, body, name);
          notificationTitleRef.current = title;
        }
      } catch (err) {
        console.error(
          `An error occured in updatePersistentNotification function 🔴`,
          err,
        );
      }
    },
    [
      name,
      notificationTitleRef,
      onCreateTriggerNotification,
      onUpdateNotification,
    ],
  );

  const updateTimerLabel = useCallback(
    function () {
      try {
        const seconds = leastTimeTimerRef.current?.timeLeft;

        let basicLabel = `${seconds >= 3600 ? Math.floor(seconds / 3600) + "h" : ""} ${seconds >= 60 ? Math.floor(seconds / 60) % 60 : ""}m`;

        timersLabel = `${workingTimersRef.current?.length - alertingTimerNamesRef.current?.length} timers`;
        // console.log("timersLabel", timersLabel, workingTimersRef.current, name);

        updateSharedObject({ timersLabel });

        if (
          workingTimersRef.current?.length -
            alertingTimerNamesRef.current?.length ===
          1
        ) {
          timersLabel = leastTimeTimerRef.current?.timerName;
          updateSharedObject({ timersLabel });
        }

        if (
          leastTimeTimerRef.current?.timeLeft > 60 &&
          leastTimeTimerRef.current?.timerName
        ) {
          timeLabelRef.current = `${basicLabel} remains`;
        }

        const isLessThenMinuteRemains =
          Math.floor(leastTimeTimerRef.current?.timeLeft) <= 60 &&
          Math.floor(leastTimeTimerRef.current?.timeLeft) > 0 &&
          !isPausedRef.current &&
          leastTimeTimerRef.current?.timerName;

        if (isLessThenMinuteRemains) {
          timeLabelRef.current = `Less then a minute remains`;
        }

        const activeTimersNumber =
          workingTimersRef.current?.length -
          alertingTimerNamesRef.current?.length;

        timeLabelRef.current = `${timeLabelRef.current} ${
          activeTimersNumber === 1 || workingTimersRef.current?.length === 1
            ? ""
            : `(${name})`
        }`;

        if (leastTimeTimerRef.current?.isPaused === true) {
          timeLabelRef.current = `Paused with ${leastTimeTimerRef.current?.timeLeft >= 60 ? basicLabel : "less then a minute"} remaining`;
        }

        if (
          leastTimeTimerRef.current?.timeLeft <= 0 &&
          alertingTimerNamesRef.current.length === 1
        ) {
          timeLabelRef.current = `Time's up`;
        }

        if (
          leastTimeTimerRef.current?.timeLeft <= 0 &&
          alertingTimerNamesRef.current.length > 1
        ) {
          timeLabelRef.current = `Time's up (${leastTimeTimerRef.current?.timerName})`;
        }

        if (
          leastTimeTimerRef.current?.timeLeft > 0 &&
          leastTimeTimerRef.current?.timerName === name
        ) {
          ongoingNotificationLabelRef.current = timeLabelRef?.current;
        }
      } catch (error) {
        console.error(`An error occured in updateTimerLabel function`, error);
      }
    },
    [
      alertingTimerNamesRef,
      isPausedRef,
      leastTimeTimerRef,
      name,
      ongoingNotificationLabelRef,
      timeLabelRef,
      workingTimersRef,
    ],
  );

  return {
    pauseListener,
    updatePersitentNotification,
    updateTimerLabel,
  };
}
