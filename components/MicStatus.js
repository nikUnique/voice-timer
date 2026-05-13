import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Text } from "../ui/AppText";
import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useIsLocked } from "../hooks/useIsLocked";
import { useResponsive } from "../hooks/useResponsive";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import IconButton from "../ui/IconButton";

export default function MicStatus() {
  const { isListening } = useRecognizerData();
  const {
    voiceEnabled,
    setVoiceEnabled,

    microGranted,
    setMicroGranted,
  } = useSettingsData();

  const { updateSettingsInStorage } = useSettingsFunctions();
  const { isPhoneLocked } = useIsLocked();
  const { t } = useResponsive();

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
    updateSettingsInStorage("voiceEnabled", !voiceEnabled);
  }

  const isListeningText = {
    fontSize: t.body,
    color: Colors.grayShade20,
    textAlignVertical: "center",
    textAlign: "left",
  };

  return (
    <Pressable
      onPress={() => {
        toggleListening();
      }}
      style={styles.pressable}
    >
      <View style={[styles.toggleListening, toggleListeningBackground]}>
        <View style={styles.isListeningStatus}>
          <IconButton
            icon={voiceEnabled && isListening ? "mic" : "mic-outline"}
            size={t.title}
            color={Colors.primary}
          />
          <Text style={isListeningText}>
            {voiceEnabled && isListening && !isPhoneLocked
              ? "Listening..."
              : "Not Listening"}
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

  isListeningStatus: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    textAlign: "left",
  },
});
