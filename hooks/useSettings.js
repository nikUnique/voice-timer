import { useEffect } from "react";
import { getItemFromStorage, setItemInStorage } from "../utils/helpers";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import { NativeModules, PermissionsAndroid, Platform } from "react-native";

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

  async function requestMicrophone() {
    try {
      let localMicroGranted;
      setVoiceEnabled(false);
      console.log("Is voice disabled :(");

      localMicroGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (!localMicroGranted) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("beny");
          setVoiceEnabled(true);
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

          const retrievedSettings = await getItemFromStorage("settings");

          if (!retrievedSettings) return;

          setAlarmVolume(+retrievedSettings.alarmVolume);
          setAutoStopAlarmTimeout(+retrievedSettings.autoStopAlarmTimeout);
          setVoiceEnabled(retrievedSettings.voiceEnabled);
          setIsVoiceFeedbackEnabled(retrievedSettings.isVoiceFeedbackEnabled);
          setKeepScreenOnCommand(retrievedSettings.keepScreenOnCommand);
          setKeepScreenOnMinutes(retrievedSettings.keepScreenOnMinutes);
          setIsVibrating(retrievedSettings.isVibrating);

          requestMicrophone();
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
