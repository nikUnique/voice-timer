import { Pressable, StyleSheet, Text, View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
import { useNavigation } from "@react-navigation/native";
import { memo, useEffect, useRef, useState } from "react";
import { Colors } from "../constants/colors";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";

export default memo(function Sound() {
  const { settingSection, setting, heading, settingLabel, slider } =
    useSettingsStyles();
  const { alarmVolume, setAlarmVolume } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();

  const [volume, setVolume] = useState(alarmVolume);
  const lastUpdatedRef = useRef(0);
  const navigation = useNavigation();
  const volumeRef = useRef(volume);
  volumeRef.current = volume; // always latest, no re-subscribe

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      clearTimeout(lastUpdatedRef.current);
      setAlarmVolume(volumeRef.current);
    });
    return () => {
      setTimeout(unsubscribe, 100);
    };
  }, [navigation, setAlarmVolume]);

  useEffect(() => {
    clearTimeout(lastUpdatedRef.current);
    lastUpdatedRef.current = setTimeout(() => {
      setAlarmVolume(volumeRef.current);
    }, 3000);
    return () => {
      clearTimeout(lastUpdatedRef.current);
    };
  }, [volume, setAlarmVolume]);

  return (
    <View style={settingSection}>
      <Text style={heading}>Sound</Text>

      <View style={setting}>
        <Text style={[settingLabel, setting]}>
          Alarm Volume: {Math.round(volume * 100)}%
        </Text>

        <View style={styles.row}>
          <Pressable
            onPress={() => {
              setVolume((prev) => (prev >= 0.1 ? prev - 0.05 : prev));
              updateSettingsInStorage(
                "alarmVolume",
                volume >= 0.1 ? volume - 0.05 : volume,
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
            value={[volume]}
            onValueChange={(value) => {
              setVolume(value[0]);
              updateSettingsInStorage("alarmVolume", value[0]);
            }}
            step={0.05}
            minimumValue={0.05}
            maximumValue={1}
            minimumTrackTintColor={Colors.primaryTint90}
            maximumTrackTintColor={Colors.primaryTint90}
            thumbTintColor={Colors.primaryTint90}
            style={slider}
            trackStyle={{ height: 4, borderRadius: 2 }}
          />

          <Pressable
            onPress={() => {
              setVolume((prev) => (prev < 1 ? prev + 0.05 : prev));
              updateSettingsInStorage(
                "alarmVolume",
                volume < 1 ? volume + 0.05 : volume,
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
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    alignSelf: "center",
    lineHeight: 18,
  },
});
