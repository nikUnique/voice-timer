import { useEffect } from "react";
import { PermissionsAndroid } from "react-native";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { getItemFromStorage } from "../utils/helpers";

export function useSettings() {
  const {
    setAlarmVolume,
    setAutoStopAlarmTimeout,
    setVoiceEnabled,
    setIsVoiceFeedbackEnabled,
    setKeepScreenOnCommand,
    setKeepScreenOnMinutes,
    setIsVibrating,
  } = useSettingsData();

  const { timers } = useRefsData();

  async function requestMicrophone() {
    try {
      let localMicroGranted;

      localMicroGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (!localMicroGranted) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setVoiceEnabled(true);
        } else {
          setVoiceEnabled(false);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

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

          setAlarmVolume(+retrievedSettings.alarmVolume);
          setAutoStopAlarmTimeout(+retrievedSettings.autoStopAlarmTimeout);
          setVoiceEnabled(retrievedSettings.voiceEnabled);
          setIsVoiceFeedbackEnabled(retrievedSettings.isVoiceFeedbackEnabled);
          setKeepScreenOnCommand(retrievedSettings.keepScreenOnCommand);
          setKeepScreenOnMinutes(retrievedSettings.keepScreenOnMinutes);
          setIsVibrating(retrievedSettings.isVibrating);
        } catch (error) {
          console.error(
            `An error occured in the load settings function`,
            error
          );
        }
      }

      load();
    },
    [
      setAlarmVolume,
      setAutoStopAlarmTimeout,
      setIsVibrating,
      setIsVoiceFeedbackEnabled,
      setKeepScreenOnCommand,
      setKeepScreenOnMinutes,
      setVoiceEnabled,
      timers.length,
    ]
  );
}
