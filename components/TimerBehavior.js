import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { memo, useState } from "react";

import { useSettingsData } from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { Colors } from "../constants/colors";
import { useResponsive } from "../hooks/useResponsive";

export default memo(function TimerBehavior() {
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
    autoStopAlarmTimeout,
    setAutoStopAlarmTimeout,
    isVibrating,
    setIsVibrating,
  } = useSettingsData();

  const { t } = useResponsive();

  const { settingPart, setting, heading, settingLabel, settingBtn, switchBox } =
    useSettingsStyles();
  const { updateSettingsInStorage, autoStopTimeoutLabel } =
    useSettingsFunctions();

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
    <View style={settingPart}>
      <Text style={heading}>Timer Behavior</Text>
      <View style={setting}>
        <Pressable
          onPress={() => {
            setShowAutoStopOptions(!showAutoStopOptions);
          }}
        >
          <Text
            style={[
              settingLabel,
              settingBtn,
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
                  updateSettingsInStorage("autoStopAlarmTimeout", finalTimeout);
                }}
              >
                <View
                  style={[
                    optionView,
                    i === arr.length - 1 && styles.lastOption,
                  ]}
                >
                  <Text style={optionText}>{option}</Text>
                </View>
              </Pressable>
            ))}
        </View>
      </View>
      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>Timer Vibrate</Text>

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
