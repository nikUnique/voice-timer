import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
    microGranted,
    setMicroGranted,
  } = useSettingsData();

  const { isListening } = useRecognizerData();
  const { isPhoneLocked } = useIsLocked();

  const toggleListeningBackground = voiceEnabled
    ? { backgroundColor: Colors.primaryTint70 }
    : { backgroundColor: Colors.primaryTint90 };

  function openSettings() {
    Linking.openSettings().catch(() => {
      Alert.alert("Unable to open settings");
    });
  }

  async function toggleListening() {
    let permission;

    let localMicroGranted;

    if (!microGranted) {
      permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      // Required manual ask if never ask again was choosen before
      if (permission === "never_ask_again") {
        permission = null;
        Alert.alert(
          "Microphone Permission Required",
          "To use voice commands, please enable microphone permission in the app settings. Navigate to Permissions -> Microphone and select one of the available options.\n\n" +
            "Currently, the option that is selected forbids the microphone access. Please choose a different option to enable microphone access for the app.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: openSettings },
          ],
        );
      }

      localMicroGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      if (!localMicroGranted && !microGranted) {
        return;
      }

      setMicroGranted(localMicroGranted);
    }

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
            color={Colors.primary}
          />
          <Text style={styles.isListeningText}>
            {voiceEnabled && isListening && !isPhoneLocked
              ? "Listening..."
              : "Not Listening"}{" "}
            (Tap to change)
          </Text>
        </View>
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
});
