import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import { Colors } from "../constants/colors";
import Slider from "@react-native-community/slider";
import { memo } from "react";

export default memo(function AppBehavior() {
  const {
    settingPart,
    setting,
    heading,
    settingLabel,
    switchBox,
    slider,
    settingBtn,
  } = useSettingsStyles();
  const {
    keepScreenOnCommand,
    setKeepScreenOnCommand,
    keepScreenOnMinutes,
    setKeepScreenOnMinutes,
  } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  return (
    <View style={settingPart}>
      <Text style={heading}>App Behavior</Text>

      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>Keep Screen On After Voice Command</Text>

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
        <View style={setting}>
          <Text style={[settingLabel, setting]}>
            Keep Screen On For: {keepScreenOnMinutes} minute
            {keepScreenOnMinutes !== 1 ? "s" : ""}
          </Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => {
                setKeepScreenOnMinutes((prev) => (prev > 1 ? prev - 1 : prev));
              }}
              style={[({ pressed }) => ({ opacity: pressed }), styles.stepBtn]}
            >
              <Text style={styles.textBtn}>−</Text>
            </Pressable>
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
              maximumValue={300}
              style={slider}
            />
            <Pressable
              onPress={() => {
                setKeepScreenOnMinutes((prev) =>
                  prev < 300 ? prev + 1 : prev,
                );
              }}
              style={styles.stepBtn}
            >
              <Text style={styles.textBtn}>+</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    backgroundColor: Colors.primaryTint90,
    borderRadius: "50%",
  },
  textBtn: {
    color: Colors.primary,
    fontSize: 18,
  },
});
