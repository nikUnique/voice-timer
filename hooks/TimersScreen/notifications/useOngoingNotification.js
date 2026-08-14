import { useEffect } from "react";
import { AppState } from "react-native";

import { useRefsData } from "../../../context/VoiceRecognizerContext";
import { getSharedObject } from "../../../utils/sharedVariables";

import { registerChannelsAndService } from "../../../utils/channelAndServiceManager";
import { useBackgroundActions } from "./useBackgroundActions";
import { useNotification } from "../../shared/useNotification";

export function useOngoingNotification() {
  const {
    setIsListening,
    isListeningRef,
    workingTimersRef,
    ongoingNotificationLabelRef,
    leastTimeTimerRef,
    alertingTimerNamesRef,
  } = useRefsData();

  const { onUpdateNotification } = useNotification();

  registerChannelsAndService();
  useBackgroundActions();

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      "change",

      async (nextAppState) => {
        try {
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
            await onUpdateNotification(
              ongoingNotificationLabelRef.current,
              getSharedObject()?.timersLabel,
              "AppStateListener in useServiceAndSpeechControl",
            );
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
    isListeningRef,
    leastTimeTimerRef,
    onUpdateNotification,
    ongoingNotificationLabelRef,
    setIsListening,
    workingTimersRef,
  ]);
}
