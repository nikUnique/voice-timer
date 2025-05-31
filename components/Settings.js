import Slider from "@react-native-community/slider";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useSettingsData } from "../context/VoiceRecognizerContext";
import {
  openNotificationChannelSettings,
  setItemInStorage,
} from "../utils/helpers";
import { Colors } from "../constants/colors";

export default function Settings() {
  const [showAutoStopOptions, setShowAutoStopOptions] = useState(false);

  const autoStopOptions = [
    "15 seconds",
    "30 seconds",
    "1 minute",
    "3 minutes",
    "5 minutes",
    "10 minutes",
    "Never",
  ];

  const {
    alarmVolume,
    setAlarmVolume,
    autoStopAlarmTimeout,
    setAutoStopAlarmTimeout,
    voiceEnabled,
    setVoiceEnabled,
    isVoiceFeedbackEnabled,
    setIsVoiceFeedbackEnabled,
    keepScreenOnCommand,
    setKeepScreenOnCommand,
    keepScreenOnMinutes,
    setKeepScreenOnMinutes,
    isVibrating,
    setIsVibrating,
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
    ]
  );

  function updateSettingsInStorage(key, value) {
    const updatedSettings = { ...settings, [key]: value };
    setItemInStorage("settings", updatedSettings);
    console.log("Settings updated 🫴");
  }

  function autoStopTimeoutLabel(secs) {
    if (secs < 60) {
      return `${secs} seconds`;
    }

    if (secs >= 60) {
      return `${secs / 60} minutes`;
    }
  }

  return (
    <View style={styles.settingsContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingPart}>
          <Text style={styles.title}>Sound</Text>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, styles.setting]}>
              Alarm Volume: {Math.round(alarmVolume * 100)}%
            </Text>

            <Slider
              value={alarmVolume}
              onSlidingComplete={(value) => {
                setAlarmVolume(Math.round(value * 100) / 100);
                updateSettingsInStorage("alarmVolume", value);
              }}
              step={0.01}
              minimumValue={0.01}
              maximumValue={1}
              minimumTrackTintColor={Colors.primaryTint90}
              maximumTrackTintColor={Colors.primaryTint90}
              thumbTintColor={Colors.primaryTint90}
              style={styles.slider}
            />
          </View>
        </View>

        <View style={styles.settingPart}>
          <Text style={styles.title}>Timer Behavior</Text>
          <View style={styles.setting}>
            <Pressable
              onPress={() => {
                setShowAutoStopOptions(!showAutoStopOptions);
              }}
            >
              <Text
                style={[
                  styles.settingLabel,
                  styles.settingBtn,
                  showAutoStopOptions && styles.unfoldedBtn,
                ]}
              >
                Auto-stop alarm after:{" "}
                {autoStopAlarmTimeout
                  ? autoStopTimeoutLabel(autoStopAlarmTimeout)
                  : "Never"}
              </Text>
            </Pressable>

            <View>
              {showAutoStopOptions &&
                autoStopOptions.map((option, i, arr) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (option.toLocaleLowerCase() === "Never") {
                        setAutoStopAlarmTimeout(0);
                        setShowAutoStopOptions(false);
                        updateSettingsInStorage("autoStopAlarmTimeout", 0);
                        return;
                      }
                      const moreThanMinute = option
                        .split(" ")
                        .at(1)
                        ?.startsWith("m");
                      let finalTimeout = Number(option.split(" ").at(0));
                      if (moreThanMinute) {
                        // Conversion to minutes
                        finalTimeout = finalTimeout * 60;
                      }

                      setAutoStopAlarmTimeout(finalTimeout);
                      setShowAutoStopOptions(false);
                      updateSettingsInStorage(
                        "autoStopAlarmTimeout",
                        finalTimeout
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.option,
                        i === arr.length - 1 && styles.lastOption,
                      ]}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </View>
                  </Pressable>
                ))}
            </View>
          </View>
          <View style={[styles.switchBox, styles.setting]}>
            <Text style={styles.settingLabel}>Timer Vibrate</Text>

            <Switch
              value={isVibrating}
              onValueChange={(value) => {
                setIsVibrating(value);
                updateSettingsInStorage("isVibrating", value);
              }}
              thumbColor={Colors.primaryTint90}
              trackColor={{
                true: Colors.primaryTint40,
              }}
            />
          </View>
        </View>

        <View style={styles.settingPart}>
          <Text style={styles.title}>Voice Control</Text>

          <View style={[styles.switchBox, styles.setting]}>
            <Text style={styles.settingLabel}>Enable Voice Commands</Text>

            <Switch
              value={voiceEnabled}
              onValueChange={(value) => {
                setVoiceEnabled(value);
                updateSettingsInStorage("voiceEnabled", value);
              }}
              thumbColor={Colors.primaryTint90}
              trackColor={{
                true: Colors.primaryTint40,
              }}
            />
          </View>

          <View style={[styles.switchBox, styles.setting]}>
            <Text style={styles.settingLabel}>Enable Voice Feedback</Text>

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

        <View style={styles.settingPart}>
          <Text style={styles.title}>App Behavior</Text>

          <View style={[styles.switchBox, styles.setting]}>
            <Text style={styles.settingLabel}>
              Keep Screen On After Voice Command
            </Text>

            <Switch
              value={keepScreenOnCommand}
              onValueChange={(value) => {
                setKeepScreenOnCommand(value);
                updateSettingsInStorage("keepScreenOnCommand", value);
              }}
              thumbColor={Colors.primaryTint90}
              trackColor={{
                true: Colors.primaryTint40,
              }}
            />
          </View>

          {keepScreenOnCommand && (
            <View style={styles.setting}>
              <Text style={[styles.settingLabel, styles.setting]}>
                Keep Screen On For: {keepScreenOnMinutes} minute
                {keepScreenOnMinutes !== 1 ? "s" : ""}
              </Text>

              <Slider
                value={keepScreenOnMinutes}
                onSlidingComplete={(value) => {
                  setKeepScreenOnMinutes(value);
                  updateSettingsInStorage("keepScreenOnMinutes", value);
                }}
                step={1}
                minimumTrackTintColor={Colors.primaryTint90}
                maximumTrackTintColor={Colors.primaryTint90}
                thumbTintColor={Colors.primaryTint90}
                minimumValue={1}
                maximumValue={30}
                style={styles.slider}
              />
            </View>
          )}
        </View>

        <View
          style={[styles.settingPart, styles.lastSettingPart, styles.setting]}
        >
          <Text style={styles.title}>Notification Settings</Text>

          <Pressable
            onPress={async () => {
              openNotificationChannelSettings("RN_BACKGROUND_ACTIONS_CHANNEL");
            }}
          >
            <View style={[styles.settingBtn, styles.setting]}>
              <Text style={styles.notificationText}>
                Hide Background Service Notification
              </Text>
            </View>
            <Text style={styles.notificationText}>
              Why remove the notification? Because it is not useful at all, but
              it appears when the app is in the background and without the
              user&apos;s permission it cannot be removed. So, in the beginning
              after installing the app there will be 2 notifications by default.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
    marginBottom: 32,
  },

  settingsContainer: {
    padding: 4,
  },

  settingPart: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryTint70,
    borderStyle: "dotted",
    padding: 8,
  },
  setting: {
    marginBottom: 16,
  },

  lastSettingPart: {
    borderBottomWidth: 0,
  },

  slider: {
    marginLeft: -10,
    marginRight: -10,
    color: Colors.primaryTint90,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 32,
    color: Colors.primaryTint90,
    marginTop: 16,
  },

  settingLabel: {
    color: Colors.primaryTint90,
    fontSize: 16,
  },

  settingBtn: {
    backgroundColor: Colors.whiteAlpha20,
    padding: 8,
    borderRadius: 8,
  },

  unfoldedBtn: {
    marginBottom: 16,
  },

  notificationText: {
    color: Colors.primaryTint90,
    fontSize: 16,
  },

  option: {
    fontSize: 16,
    padding: 8,
    marging: 8,
    marginLeft: 0,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 8,
    borderBottomColor: Colors.primaryTint90,
    borderBottomWidth: 1,
  },

  lastOption: {
    borderBottomWidth: 0,
  },

  optionText: {
    color: Colors.primaryTint90,
    fontSize: 16,
  },

  switchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
