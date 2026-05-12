import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import BackgroundService from "react-native-background-actions";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { getSharedObject } from "../utils/sharedVariables";

import { registerChannelsAndService } from "../utils/channelAndServiceManaber";
import { useBackgroundActions } from "./useBackgroundActions";
import { useNotification } from "./useNotification";
import { useTimer } from "./useTimer";
import Tts from "react-native-tts";

export function useServiceAndSpeechControl() {
  const {
    setIsListening,
    isListeningRef,
    workingTimersRef,
    ongoingNotificationLabelRef,
    leastTimeTimerRef,
    alertingTimerNamesRef,
  } = useRefsData();

  const { options, backgroundTask } = useTimer();

  const { onUpdateNotification } = useNotification();

  registerChannelsAndService();
  useBackgroundActions();

  useEffect(() => {
    setIsListening(true);
    isListeningRef.current = true;

    const appStateListener = AppState.addEventListener(
      "change",

      async (nextAppState) => {
        try {
          if (nextAppState !== "active") {
            // setIsListening(false);
            // isListeningRef.current = false;
            // await BackgroundService.start(backgroundTask, options);
          }

          const areThereNotCompletedTimers =
            workingTimersRef.current.length &&
            workingTimersRef.current.length -
              getSharedObject()?.alertingTimerNames.length >
              0;

          if (
            nextAppState !== "active" &&
            areThereNotCompletedTimers &&
            !leastTimeTimerRef.current?.isPaused &&
            leastTimeTimerRef.current
          ) {
            // if (Platform.constants.Release < 12) {
            //   await BackgroundService.start(backgroundTask, options);
            //   console.log("Did it start");
            // }

            await onUpdateNotification(
              ongoingNotificationLabelRef.current,
              getSharedObject()?.timersLabel,
              "AppStateListener in useServiceAndSpeechControl",
            );
          }

          if (AppState.currentState === "active") {
            isListeningRef.current = true;
            setIsListening(true);

            // await BackgroundService?.stop();
            // await notifee.stopForegroundService();
          }
        } catch (error) {
          console.error(
            `An error happened in appStateListener where background service and setIsListening work`,
            error,
          );
        }
      },
    );

    return () => {
      appStateListener.remove();
    };
  }, [
    alertingTimerNamesRef,
    backgroundTask,
    isListeningRef,
    leastTimeTimerRef,
    onUpdateNotification,
    ongoingNotificationLabelRef,
    options,
    setIsListening,
    workingTimersRef,
  ]);
}
