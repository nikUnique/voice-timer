import { useEffect } from "react";
import { getItemFromStorage, setItemInStorage } from "../utils/helpers";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import { NativeModules, Platform } from "react-native";

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

  useEffect(
    function () {
      async function load() {
        try {
          // console.log("Settings retrieved from storage 🤡");

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
    ]
  );
}
