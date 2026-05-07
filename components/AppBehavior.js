import { Slider } from "@miblanchard/react-native-slider";
import { useNavigation } from "@react-navigation/native";

import { memo, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";

export default memo(function AppBehavior() {
  const { settingPart, setting, heading, settingLabel, switchBox, slider } =
    useSettingsStyles();

  const {
    keepScreenOnCommand,
    setKeepScreenOnCommand,
    keepScreenOnMinutes,
    setKeepScreenOnMinutes,
    keepScreenDim,
    setKeepScreenDim,
  } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  const [minutes, setMinutes] = useState(keepScreenOnMinutes);
  const lastUpdatedRef = useRef(0);
  const navigation = useNavigation();

  const minutesRef = useRef(minutes);
  minutesRef.current = minutes; // always latest, no re-subscribe

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      clearTimeout(lastUpdatedRef.current);
      setKeepScreenOnMinutes(minutesRef.current);
    });
    return () => {
      setTimeout(unsubscribe, 100);
    };
  }, [navigation, setKeepScreenOnMinutes]);

  useEffect(() => {
    clearTimeout(lastUpdatedRef.current);
    lastUpdatedRef.current = setTimeout(() => {
      setKeepScreenOnMinutes(minutes);
    }, 3000);
    return () => {
      clearTimeout(lastUpdatedRef.current);
    };
  }, [minutes, setKeepScreenOnMinutes]);

  const steps = [1, 2, 3, 5, 10, 15, 30, 60, 90, 120, 180, 240, 300];
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
            Keep Screen On For: {minutes} minute
            {minutes !== 1 ? "s" : ""}
          </Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => {
                const i = steps.indexOf(minutes);
                setMinutes((prev) => (prev > 1 ? steps[i - 1] : prev));
              }}
              style={[({ pressed }) => ({ opacity: pressed }), styles.stepBtn]}
            >
              <Text style={styles.textBtn}>−</Text>
            </Pressable>
            <Slider
              containerStyle={{ flex: 1 }}
              value={[steps.indexOf(minutes)]}
              onSlidingComplete={([i]) => {
                setMinutes(steps[i]);
                updateSettingsInStorage("keepScreenOnMinutes", steps[i]);
              }}
              step={1}
              minimumTrackTintColor={Colors.primaryTint90}
              maximumTrackTintColor={Colors.primaryTint90}
              thumbTintColor={Colors.primaryTint90}
              minimumValue={1}
              maximumValue={steps.length - 1}
              style={slider}
              trackStyle={{ height: 4, borderRadius: 2 }}
            />
            <Pressable
              onPress={() => {
                const i = steps.indexOf(minutes);
                setMinutes((prev) => (prev < 300 ? steps[i + 1] : prev));
              }}
              style={styles.stepBtn}
            >
              <Text style={styles.textBtn}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>
          Keep Screen Dim (Locks brightness to minimum while the app is open.
          Useful when you prefer a dark screen without locking your device.)
        </Text>

        <Switch
          value={keepScreenDim}
          onValueChange={(value) => {
            setKeepScreenDim(value);
            updateSettingsInStorage("keepScreenDim", value);
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
