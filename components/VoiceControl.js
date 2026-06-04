import {
  Alert,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { memo, useState } from "react";
import { Colors } from "../constants/colors";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import { useResponsive } from "../hooks/useResponsive";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { VOICE_FEEDBACK_SPEEDS } from "../utils/config";

function getSpeedLabel(value) {
  if (+value <= 0.3) return "Slow";
  if (+value <= 0.6) return "Normal";
  if (+value <= 0.9) return "Fast";
  return "Super Fast";
}
export default memo(function VoiceControl() {
  const [showVoiceFeedbackSpeed, setShowVoiceFeedbackSpeed] = useState(false);

  const { settingPart, setting, heading, settingLabel, switchBox, settingBtn } =
    useSettingsStyles();
  const { updateSettingsInStorage, openSettings } = useSettingsFunctions();
  const {
    voiceEnabled,
    setVoiceEnabled,
    isVoiceFeedbackEnabled,
    setIsVoiceFeedbackEnabled,
    voiceFeedbackSpeedRef,
    microGranted,
    setMicroGranted,
  } = useSettingsData();

  const [voiceFeedbackSpeed, setVoiceFeedbackSpeed] = useState(
    voiceFeedbackSpeedRef.current,
  );

  const { t } = useResponsive();
  const optionView = {
    fontSize: t.subheading,
    padding: 4,
    margin: 4,
    marginLeft: 0,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 8,
    borderBottomColor: Colors.primaryTint90,
    borderBottomWidth: 1,
  };

  const optionText = {
    color: Colors.primaryTint90,
    fontSize: t.body,
  };

  return (
    <>
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
                // Required manual ask if never ask again was chosen before
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
        {isVoiceFeedbackEnabled && (
          <View style={setting}>
            <Pressable
              onPress={() => {
                setShowVoiceFeedbackSpeed(!showVoiceFeedbackSpeed);
              }}
            >
              {
                <Text
                  style={[
                    settingLabel,
                    settingBtn,
                    showVoiceFeedbackSpeed && styles.unfoldedBtn,
                  ]}
                >
                  Voice Feedback Speed: {getSpeedLabel(voiceFeedbackSpeed)}
                </Text>
              }
            </Pressable>

            <View style={setting}>
              {showVoiceFeedbackSpeed &&
                VOICE_FEEDBACK_SPEEDS.map((option, i, arr) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setVoiceFeedbackSpeed(+option.value);
                      setShowVoiceFeedbackSpeed(false);
                      voiceFeedbackSpeedRef.current = +option.value;

                      updateSettingsInStorage(
                        "voiceFeedbackSpeed",
                        +option.value,
                      );
                    }}
                  >
                    <View
                      style={[
                        optionView,
                        i === arr.length - 1 && styles.lastOption,
                      ]}
                    >
                      <Text style={optionText}>{option.label}</Text>
                    </View>
                  </Pressable>
                ))}
            </View>
          </View>
        )}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  unfoldedBtn: {
    marginBottom: 16,
  },

  lastOption: {
    borderBottomWidth: 0,
  },
});
