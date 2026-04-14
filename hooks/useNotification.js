import notifee, {
  AndroidCategory,
  AndroidImportance,
  TriggerType,
} from "@notifee/react-native";
import { useCallback } from "react";
import { AppState, NativeModules } from "react-native";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { emitter } from "../utils/EventEmitter";
import { getSharedObject } from "../utils/sharedVariables.js";

let stopServiceTimeout;

export function useNotification() {
  const {
    notificationIdRef,
    workingTimersRef,
    leastTimeTimerRef,
    alertingTimerNamesRef,
  } = useRefsData();

  const onCreateTriggerNotification = useCallback(
    async function onCreateTriggerNotification(title, body, timerName) {
      try {
        if (!title) return;

        const date = new Date(Date.now() + 1000);

        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: date.getTime(),
        };

        let isPhoneLocked =
          await NativeModules.NativeUtilsModule.isPhoneLocked();

        emitter.emit(`updateList`);

        let notificationCategory = AndroidCategory.CALL;

        if (
          getSharedObject().alertingTimerNames.length > 1 &&
          !isPhoneLocked &&
          AppState.currentState === "active"
        ) {
          notificationCategory = AndroidCategory.SERVICE;
        }

        const selectedChannelId =
          AppState.currentState === "active" && !isPhoneLocked;

        await notifee.createTriggerNotification(
          {
            id: "ALARM_NOTIFICATION",
            title,
            body,

            android: {
              channelId: selectedChannelId
                ? "channel-with-silent-mode"
                : "full-screen-channel",
              category: notificationCategory,
              importance: AndroidImportance.HIGH,
              autoCancel: false,

              showChronometer: true,
              // asForegroundService: true,
              ongoing: true,
              lightUpScreen: true,
              smallIcon: "ic_launcher_notification",
              color: "#edf2ff",

              fullScreenAction: {
                id: "default",
                launchActivity: "default",
              },

              // pressAction: {
              //   // id: "default",
              //   // launchActivity: "default",
              //   // launchActivity: `com.moonnic.timer_with_commands.MainActivity`,
              // },

              actions: [
                {
                  title:
                    alertingTimerNamesRef.current.length > 1
                      ? "Stop all timers"
                      : "Stop",
                  pressAction: {
                    id: "resetAllFinishedTimers",
                  },
                },
              ],
            },

            data: {
              timerName,
            },
          },
          trigger,
        );
      } catch (err) {
        console.error(
          `An error occurred in onCreateTriggerNotification function 🔴`,
          err,
        );
      }
    },
    [alertingTimerNamesRef],
  );

  const onUpdateNotification = useCallback(
    async function onUpdateNotification(title, body, timerName, recursive) {
      try {
        clearTimeout(stopServiceTimeout);

        if (!title) {
          return;
        }

        if (
          workingTimersRef.current.length &&
          workingTimersRef.current.length -
            alertingTimerNamesRef.current.length ===
            0
        ) {
          // notifee.stopForegroundService();
          return;
        }

        let actions = workingTimersRef.current.length > 1 && [
          {
            title: "Reset all timers",
            pressAction: {
              id: "resetAllTimers",
            },
          },
        ];

        const sum =
          workingTimersRef.current.length -
          alertingTimerNamesRef.current.length;

        if (
          (workingTimersRef.current.length === 1 || sum === 1) &&
          leastTimeTimerRef.current?.timeLeft > 0 &&
          title?.toLowerCase()?.includes("pause")
        ) {
          actions = [
            {
              title: "Resume",
              pressAction: {
                id: "resumeTimer",
              },
            },
            {
              title: "Reset",
              pressAction: {
                id: "resetTimer",
              },
            },
          ];
        }

        if (
          (workingTimersRef.current.length === 1 ||
            workingTimersRef.current.length -
              alertingTimerNamesRef.current.length ===
              1) &&
          !title?.toLowerCase()?.includes("pause")
        ) {
          actions = [
            {
              title: "Pause",
              pressAction: {
                id: "pauseTimer",
              },
            },
          ];
        }

        const isOneTimerPaused =
          leastTimeTimerRef.current?.isPaused &&
          workingTimersRef.current.length === 1;

        if (isOneTimerPaused && !recursive) {
          stopServiceTimeout = setTimeout(function () {
            if (!workingTimersRef.current.length) return;
            // notifee.stopForegroundService();
            if (AppState.currentState === "active") return;
            onUpdateNotification(title, body, timerName, true);
          }, 5000);
        }

        await notifee.displayNotification({
          ...(notificationIdRef.current && { id: notificationIdRef.current }),

          title,
          body,
          android: {
            color: "#edf2ff",
            channelId: "channel-with-silent-mode",
            category: AndroidCategory.ALARM,
            importance: AndroidImportance.DEFAULT,

            // ...(!isOneTimerPaused && { asForegroundService: true }),

            // ...((isOneTimerPaused || AppState.currentState === "active") && {
            //   asForegroundService: false,
            // }),

            autoCancel: false,
            smallIcon: "ic_launcher_notification",

            ...(actions && { actions }),

            pressAction: {
              id: "default",
              launchActivity: "default",
            },
          },
          data: {
            timerName,
          },
        });
      } catch (err) {
        console.error(
          `An error occurred in onUpdateNotification function 🔴`,
          err,
        );
      }
    },
    [
      alertingTimerNamesRef,
      leastTimeTimerRef,
      notificationIdRef,
      workingTimersRef,
    ],
  );

  return { onCreateTriggerNotification, onUpdateNotification };
}
