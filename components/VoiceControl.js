import { Alert, PermissionsAndroid, Switch, Text, View } from "react-native";

import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import { Colors } from "../constants/colors";
import { memo } from "react";

export default memo(function VoiceControl() {
  const { settingPart, setting, heading, settingLabel, switchBox } =
    useSettingsStyles();
  const { updateSettingsInStorage, openSettings } = useSettingsFunctions();
  const {
    voiceEnabled,
    setVoiceEnabled,
    isVoiceFeedbackEnabled,
    setIsVoiceFeedbackEnabled,

    microGranted,
    setMicroGranted,
  } = useSettingsData();
  return (
    <View style={settingPart}>
      <Text style={heading}>Voice Control</Text>

      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>Enable Voice Commands</Text>

        <Switch
          value={voiceEnabled}
          onValueChange={async (value) => {
            let localMicroGranted, permission;
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

            setVoiceEnabled(value);
            updateSettingsInStorage("voiceEnabled", value);
          }}
          thumbColor={Colors.primaryTint90}
          trackColor={{
            true: Colors.primaryTint40,
          }}
        />
      </View>

      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>Enable Voice Feedback</Text>

        <Switch
          value={isVoiceFeedbackEnabled}
          onValueChange={(value) => {
            setIsVoiceFeedbackEnabled(value);
            updateSettingsInStorage("isVoiceFeedbackEnabled", value);
          }}
          thumbColor={Colors.primaryTint90}
          trackColor={{
            true: Colors.primaryTint40,
          }}
        />
      </View>
    </View>
  );
});
