import { useCallback, useMemo } from "react";
import { Alert, Linking } from "react-native";

import { setItemInStorage } from "../../utils/helpers";
import { useSettingsData } from "../../context/VoiceRecognizerContext";

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
    isSkipCommandsEnabledRef,
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
      voiceEnabled,
    ],
  );
  const updateSettingsInStorage = useCallback(
    function (key, value) {
      // Read the live refs at save time, not in a render-time memo: the memo's
      // ref deps are stable, so it captured stale values and could persist an
      // out-of-date voiceFeedbackSpeed/permitAnswerCalls/isSkipCommandsEnabled
      // whenever a different setting was toggled.
      const updatedSettings = {
        ...settings,
        voiceFeedbackSpeed: voiceFeedbackSpeedRef.current,
        permitAnswerCalls: permitAnswerCallsRef.current,
        isSkipCommandsEnabled: isSkipCommandsEnabledRef.current,
        [key]: value,
      };
      setItemInStorage("settings", updatedSettings);
      console.log("Settings updated 🫴", updatedSettings);
    },
    [
      settings,
      voiceFeedbackSpeedRef,
      permitAnswerCallsRef,
      isSkipCommandsEnabledRef,
    ],
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
