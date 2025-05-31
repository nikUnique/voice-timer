import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useIsLocked } from "../hooks/useIsLocked";
import { setItemInStorage } from "../utils/helpers";

export default function MicStatus() {
  const {
    alarmVolume,
    autoStopAlarmTimeout,
    voiceEnabled,
    setVoiceEnabled,
    isVoiceFeedbackEnabled,
    keepScreenOnCommand,
    keepScreenOnMinutes,
    isVibrating,
  } = useSettingsData();
  const { isListening } = useRecognizerData();
  const { isPhoneLocked } = useIsLocked();

  const toggleListeningBackground = voiceEnabled
    ? { backgroundColor: Colors.primaryTint70 }
    : { backgroundColor: Colors.primaryTint90 };

  function toggleListening() {
    setVoiceEnabled((prevState) => !prevState);
    setItemInStorage("settings", {
      alarmVolume,
      autoStopAlarmTimeout,
      voiceEnabled: !voiceEnabled,
      setVoiceEnabled,
      isVoiceFeedbackEnabled,
      keepScreenOnCommand,
      keepScreenOnMinutes,
      isVibrating,
    });
  }

  return (
    <Pressable
      onPress={() => {
        toggleListening();
      }}
      style={styles.pressable}
    >
      <View style={[styles.toggleListening, toggleListeningBackground]}>
        <View style={styles.isListeningStatus}>
          <Ionicons
            name={voiceEnabled && isListening ? "mic" : "mic-outline"}
            size={24}
            color={
              /* voiceEnabled ? Colors.primary : Colors.grayShade20 */ Colors.primary
            }
          />
          <Text style={styles.isListeningText}>
            {voiceEnabled && isListening && !isPhoneLocked
              ? "Listening..."
              : "Not Listening"}{" "}
            (Tap to change)
          </Text>
        </View>
        {/* <View style={styles.listeningStatusSwitch}>
          <Text style={styles.tapToChange}>Tap to change</Text>
        </View> */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    zIndex: 1000,
  },
  toggleListening: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
  },

  isListeningText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.grayShade20,
  },

  isListeningStatus: {
    flexDirection: "row",
  },

  listeningStatusSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tapToChange: {
    color: Colors.grayShade20,
  },
});
