import notifee, { EventType } from "@notifee/react-native";
import { useCallback, useEffect } from "react";
import { NativeModules } from "react-native";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { emitter, resetTimerEmitter } from "../utils/EventEmitter";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import { STOP } from "../utils/en_commands";
import { cleanStop } from "../utils/helpers";

export function useBackgroundActions() {
  const { workingTimersRef, leastTimeTimerRef, currentActivityRef } =
    useRefsData();

  const resetTimer = useCallback(function resetTimer(name) {
    resetTimerEmitter.emit(`${STOP} ${name}`);
  }, []);

  const resetAllTimers = useCallback(
    function resetAllTimers() {
      console.log(STOP, "IS STOP");

      workingTimersRef.current.map((timerName) => {
        resetTimerEmitter.emit(`${STOP} ${timerName}`);
      });
    },
    [workingTimersRef],
  );

  const resetAllFinishedTimers = useCallback(function resetAllTimers() {
    updateSharedObject({ resetAllFinishedFromApp: true });
    getSharedObject()?.alertingTimerNames?.map((timerName) => {
      resetTimerEmitter.emit(`${STOP} ${timerName}`);
    });
  }, []);

  const pauseTimer = useCallback(
    async function pauseTimer() {
      emitter.emit(`pauseBackground-${leastTimeTimerRef.current?.timerName}`);
    },
    [leastTimeTimerRef],
  );

  const resumeTimer = useCallback(
    function resumeTimer() {
      emitter.emit(`resumeBackground-${leastTimeTimerRef.current?.timerName}`);
    },
    [leastTimeTimerRef],
  );

  useEffect(
    function () {
      let unsubcsribeForeground;
      async function load() {
        unsubcsribeForeground?.();
        unsubcsribeForeground = notifee.onForegroundEvent(
          async ({ type, detail }) => {
            if (type === EventType.ACTION_PRESS) {
              const { timerName } = detail.notification.data;

              switch (detail.pressAction.id) {
                case "resetTimer":
                  resetTimer(timerName);
                  break;

                case "resetAllTimers":
                  resetAllTimers();
                  break;

                case "resetAllFinishedTimers":
                  resetAllFinishedTimers();
                  break;

                default:
                  break;
              }
            }
          },
        );

        notifee.onBackgroundEvent(async ({ type, detail }) => {
          try {
            const activity =
              await NativeModules.NativeUtilsModule.getCurrentActivityName();

            currentActivityRef.current = activity;

            if (type === EventType.PRESS) {
              updateSharedObject({ notificationTap: true });
            }

            if (type === EventType.DISMISSED) {
              cleanStop();
            }

            if (type === EventType.ACTION_PRESS) {
              const { timerName } = detail.notification.data;
              let notificationId;

              switch (detail.pressAction.id) {
                case "resetTimer":
                  notificationId = detail.notification?.id;
                  notifee.cancelDisplayedNotification(notificationId);

                  resetTimer(timerName);
                  break;

                case "pauseTimer":
                  pauseTimer(timerName);
                  break;

                case "resumeTimer":
                  resumeTimer(timerName);
                  break;

                case "resetAllTimers":
                  resetAllTimers();
                  break;

                case "resetAllFinishedTimers":
                  resetAllFinishedTimers();
                  break;

                default:
                  break;
              }
            }
          } catch (err) {
            console.error(
              `An error occurred in onBackgroundEvent handler 🔴`,
              err,
            );
          }
        });
      }

      load();
    },
    [
      /* currentActivityRef, pauseTimer, resetAllTimers, resetTimer, resumeTimer */
    ],
  );
}
