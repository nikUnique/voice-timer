import { useCallback, useEffect } from "react";
import { PermissionsAndroid } from "react-native";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { getItemFromStorage } from "../utils/helpers";
import { emitter } from "../utils/EventEmitter";

export function useSettings() {
  const {
    setAlarmVolume,
    setAutoStopAlarmTimeout,
    setVoiceEnabled,
    setIsVoiceFeedbackEnabled,
    setKeepScreenOnCommand,
    setKeepScreenOnMinutes,
    setIsVibrating,
    setKeepScreenDim,
    voiceFeedbackSpeedRef,
    permitAnswerCallsRef,
  } = useSettingsData();

  const { timers } = useRefsData();

  const requestMicrophone = useCallback(
    async function () {
      try {
        console.log("Works everywhere");

        let localMicroGranted;

        localMicroGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        if (!localMicroGranted) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            emitter.emit("startForegroundService");
            console.log("It starts the service");

            setVoiceEnabled(true);
          } else {
            setVoiceEnabled(false);
          }
        }
      } catch (error) {
        console.warn(error);
      }
    },
    [setVoiceEnabled],
  );

  useEffect(
    function () {
      async function load() {
        try {
          // console.log("Settings retrieved from storage 🤡");

          if (timers.length > 0) {
            requestMicrophone();
          }
          const retrievedSettings = await getItemFromStorage("settings");

          if (!retrievedSettings) return;
          console.log(retrievedSettings);

          setAlarmVolume(+retrievedSettings.alarmVolume);
          setAutoStopAlarmTimeout(+retrievedSettings.autoStopAlarmTimeout);
          setVoiceEnabled(retrievedSettings.voiceEnabled);
          setIsVoiceFeedbackEnabled(retrievedSettings.isVoiceFeedbackEnabled);
          setKeepScreenOnCommand(retrievedSettings.keepScreenOnCommand);
          setKeepScreenOnMinutes(retrievedSettings.keepScreenOnMinutes);
          setIsVibrating(retrievedSettings.isVibrating);
          setKeepScreenDim(retrievedSettings.keepScreenDim);
          voiceFeedbackSpeedRef.current = +retrievedSettings.voiceFeedbackSpeed;
          permitAnswerCallsRef.current = retrievedSettings.permitAnswerCalls;
        } catch (error) {
          console.error(
            `An error occurred in the load settings function`,
            error,
          );
        }
      }

      load();
    },
    [
      permitAnswerCallsRef,
      requestMicrophone,
      setAlarmVolume,
      setAutoStopAlarmTimeout,
      setIsVibrating,
      setIsVoiceFeedbackEnabled,
      setKeepScreenDim,
      setKeepScreenOnCommand,
      setKeepScreenOnMinutes,
      setVoiceEnabled,
      timers.length,
      voiceFeedbackSpeedRef,
    ],
  );
}
