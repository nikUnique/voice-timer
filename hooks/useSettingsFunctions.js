import { useCallback, useMemo } from "react";
import { Alert, Linking } from "react-native";

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
    voiceFeedbackSpeedRef,
    isVibrating,
    keepScreenDim,
    permitAnswerCallsRef,
    isHeadsetBroken,
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
      keepScreenDim,
      voiceFeedbackSpeed: voiceFeedbackSpeedRef.current,
      permitAnswerCalls: permitAnswerCallsRef.current,
      isHeadsetBroken,
    }),
    [
      alarmVolume,
      autoStopAlarmTimeout,
      isHeadsetBroken,
      isVibrating,
      isVoiceFeedbackEnabled,
      keepScreenDim,
      keepScreenOnCommand,
      keepScreenOnMinutes,
      permitAnswerCallsRef,
      voiceEnabled,
      voiceFeedbackSpeedRef,
    ],
  );
  const updateSettingsInStorage = useCallback(
    function (key, value) {
      const updatedSettings = { ...settings, [key]: value };
      setItemInStorage("settings", updatedSettings);
      console.log("Settings updated 🫴", updatedSettings);
    },
    [settings],
  );

  const autoStopTimeoutLabel = useCallback(function (secs) {
    if (secs < 60) {
      return `${secs} seconds`;
    }

    if (secs >= 60) {
      return `${secs / 60} minutes`;
    }
  }, []);

  const openSettings = useCallback(function () {
    Linking.openSettings().catch(() => {
      Alert.alert("Unable to open settings");
    });
  }, []);

  return { updateSettingsInStorage, autoStopTimeoutLabel, openSettings };
}
