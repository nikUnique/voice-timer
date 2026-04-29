import { useCallback, useMemo } from "react";
import { setItemInStorage } from "../utils/helpers";
import { useSettingsData } from "../context/VoiceRecognizerContext";

export default function useSettingsFunctions() {
  const {
    alarmVolume,
    autoStopAlarmTimeout,
    voiceEnabled,
    isVoiceFeedbackEnabled,
    keepScreenOnCommand,
    keepScreenOnMinutes,
    isVibrating,
  } = useSettingsData();
  
  const settings = useMemo(
    () => ({
      alarmVolume,
      autoStopAlarmTimeout,
      voiceEnabled,
      isVoiceFeedbackEnabled,
      keepScreenOnCommand,
      keepScreenOnMinutes,
      isVibrating,
    }),
    [
      alarmVolume,
      autoStopAlarmTimeout,
      isVibrating,
      isVoiceFeedbackEnabled,
      keepScreenOnCommand,
      keepScreenOnMinutes,
      voiceEnabled,
    ],
  );
  const updateSettingsInStorage = useCallback(
    function (key, value) {
      const updatedSettings = { ...settings, [key]: value };
      setItemInStorage("settings", updatedSettings);
      console.log("Settings updated 🫴");
    },
    [settings],
  );

  return { updateSettingsInStorage };
}
