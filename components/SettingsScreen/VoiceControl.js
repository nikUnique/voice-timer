import { memo, useState } from "react";
import {
  Alert,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import { Slider } from "@miblanchard/react-native-slider";

import { Text } from "../../ui/AppText";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { useSettingsData } from "../../context/VoiceRecognizerContext";
import useSettingsFunctions from "../../hooks/SettingsScreen/useSettingsFunctions";
import useSettingsStyles from "../../hooks/SettingsScreen/useSettingsStyles";
import { VOICE_FEEDBACK_SPEEDS } from "../../utils/config";
import { ExpandableSetting } from "../../ui/ExpandableSetting";

function getSpeedLabel(value) {
  if (+value <= 0.3) return "Slow";
  if (+value <= 0.6) return "Normal";
  if (+value <= 0.9) return "Fast";
  return "Super Fast";
}
export default memo(function VoiceControl() {
  const [showVoiceFeedbackSpeed, setShowVoiceFeedbackSpeed] = useState(false);

  const {
    settingSection,
    setting,
    heading,
    settingLabel,
    switchBox,
    settingBtn,
    dividerLine,
    settingDescription,
    slider,
  } = useSettingsStyles();

  const { updateSettingsInStorage, openSettings } = useSettingsFunctions();

  const {
    voiceEnabled,
    setVoiceEnabled,
    isVoiceFeedbackEnabled,
    setIsVoiceFeedbackEnabled,
    voiceFeedbackSpeedRef,
    voiceFeedbackPitchRef,
    microGranted,
    setMicroGranted,
  } = useSettingsData();

  const [voiceFeedbackSpeed, setVoiceFeedbackSpeed] = useState(
    voiceFeedbackSpeedRef.current,
  );
  const [voiceFeedbackPitch, setVoiceFeedbackPitch] = useState(
    voiceFeedbackPitchRef.current,
  );

  const optionView = {
    fontSize: FONT.subheading,
    padding: SPACE.sm,
    margin: SPACE.sm,
    marginLeft: 0,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: RADIUS.chip,
    borderBottomColor: Colors.primaryTint90,
    borderBottomWidth: 1,
  };

  const optionText = {
    color: Colors.primaryTint90,
    fontSize: FONT.body,
  };

  return (
    <>
      <View style={settingSection}>
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

        <View style={dividerLine}></View>

        <View style={[switchBox, setting]}>
          <ExpandableSetting
            label='Enable Voice Feedback'
            labelStyle={settingLabel}
            descriptionStyle={settingDescription}
            description={`Spoken responses for commands. Calling and other confirmation-based commands require this to be on. Some commands, like a time or status report, also rely on speech to respond and won't work without it.`}
          />

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
          <>
            <View style={setting}>
              <View style={dividerLine}></View>
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

              <View>
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
            <View style={dividerLine}></View>

            <View style={setting}>
              <Text style={[settingLabel, setting]}>
                Voice Feedback Pitch: {Math.round(voiceFeedbackPitch * 100)}%
              </Text>
              <View style={styles.row}>
                <Pressable
                  onPress={() => {
                    setVoiceFeedbackPitch((prev) =>
                      prev >= 0.2 ? prev - 0.1 : prev,
                    );
                    voiceFeedbackPitchRef.current =
                      voiceFeedbackPitchRef.current >= 0.2
                        ? voiceFeedbackPitchRef.current - 0.1
                        : voiceFeedbackPitchRef.current;
                    updateSettingsInStorage(
                      "voiceFeedbackPitch",
                      voiceFeedbackPitch >= 0.1
                        ? voiceFeedbackPitch - 0.1
                        : voiceFeedbackPitch,
                    );
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <View style={styles.stepBtn}>
                    <Text style={styles.textBtn}>−</Text>
                  </View>
                </Pressable>

                <Slider
                  containerStyle={{ flex: 1 }}
                  value={[voiceFeedbackPitch]}
                  onValueChange={(value) => {
                    setVoiceFeedbackPitch(value[0]);
                    voiceFeedbackPitchRef.current = value[0];
                    updateSettingsInStorage("voiceFeedbackPitch", value[0]);
                  }}
                  step={0.1}
                  minimumValue={0.1}
                  maximumValue={2}
                  minimumTrackTintColor={Colors.primaryTint90}
                  maximumTrackTintColor={Colors.primaryTint90}
                  thumbTintColor={Colors.primaryTint90}
                  style={slider}
                  trackStyle={{ height: 4, borderRadius: RADIUS.minimal }}
                />
                <Pressable
                  onPress={() => {
                    setVoiceFeedbackPitch((prev) =>
                      prev < 2 ? prev + 0.1 : prev,
                    );
                    voiceFeedbackPitchRef.current =
                      voiceFeedbackPitchRef.current < 2
                        ? voiceFeedbackPitchRef.current + 0.1
                        : voiceFeedbackPitchRef.current;
                    updateSettingsInStorage(
                      "voiceFeedbackPitch",
                      voiceFeedbackPitch < 2
                        ? voiceFeedbackPitch + 0.1
                        : voiceFeedbackPitch,
                    );
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <View style={styles.stepBtn}>
                    <Text style={styles.textBtn}>+</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  unfoldedBtn: {
    marginBottom: SPACE.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.md,
  },
  stepBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    backgroundColor: Colors.primaryTint90,
    borderRadius: "50%",
  },

  lastOption: {
    borderBottomWidth: 0,
  },
});
