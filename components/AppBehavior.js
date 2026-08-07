import { Slider } from "@miblanchard/react-native-slider";
import { useNavigation } from "@react-navigation/native";

import { memo, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { Colors } from "../constants/colors";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";
import BrokenMic from "./BrokenMic";
import { ExpandableSetting } from "../ui/ExpandableSetting";

export default memo(function AppBehavior() {
  const {
    settingSection,
    setting,
    heading,
    settingLabel,
    switchBox,
    slider,
    settingDescription,
    dividerLine,
  } = useSettingsStyles();

  const {
    keepScreenOnCommand,
    setKeepScreenOnCommand,
    keepScreenOnMinutes,
    setKeepScreenOnMinutes,
    keepScreenDim,
    setKeepScreenDim,
    permitAnswerCallsRef,
  } = useSettingsData();

  const { updateSettingsInStorage } = useSettingsFunctions();
  const [minutes, setMinutes] = useState(keepScreenOnMinutes);
  const lastUpdatedRef = useRef(0);
  const navigation = useNavigation();

  const minutesRef = useRef(minutes);
  minutesRef.current = minutes; // always latest, no re-subscribe
  const [permitAnswerCall, setPermitAnswerCall] = useState(
    permitAnswerCallsRef.current,
  );

  useEffect(
    function () {
      async function load() {
        if (permitAnswerCall === true) {
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS,
          ]);

          const allGranted = Object.values(results).every(
            (r) => r === PermissionsAndroid.RESULTS.GRANTED,
          );

          if (!allGranted) {
            const denied = Object.entries(results)
              .filter(([_, r]) => r !== PermissionsAndroid.RESULTS.GRANTED)
              .map(([perm]) => perm);

            if (denied) {
              permitAnswerCallsRef.current = false;
              setPermitAnswerCall(false);
              updateSettingsInStorage("permitAnswerCalls", false);
            }
          }
        }
      }
      load();
    },
    [permitAnswerCall, permitAnswerCallsRef, updateSettingsInStorage],
  );

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
    <View style={settingSection}>
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

      <View style={dividerLine}></View>

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
                updateSettingsInStorage(
                  "keepScreenOnMinutes",
                  minutes > 1 ? steps[i - 1] : minutes,
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
                updateSettingsInStorage(
                  "keepScreenOnMinutes",
                  minutes < 300 ? steps[i + 1] : minutes,
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
      )}

      <View style={dividerLine}></View>

      <View style={[switchBox, setting]}>
        <ExpandableSetting
          label='Keep Screen Dim'
          labelStyle={settingLabel}
          descriptionStyle={settingDescription}
          description={`Locks brightness to minimum while the app is open. Useful when you prefer a dark screen without locking your device.`}
        />

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
      <View style={dividerLine}></View>

      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>Answer calls with voice</Text>
        <Switch
          value={permitAnswerCall}
          onValueChange={async (value) => {
            if (value === true) {
              const results = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS,
              ]);

              const allGranted = Object.values(results).every(
                (r) => r === PermissionsAndroid.RESULTS.GRANTED,
              );

              if (!allGranted) {
                const denied = Object.entries(results)
                  .filter(([_, r]) => r !== PermissionsAndroid.RESULTS.GRANTED)
                  .map(([perm]) => perm);
                console.warn("Permissions denied: ", denied);

                const isPermanentlyDenied = Object.values(results).includes(
                  PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
                );

                if (isPermanentlyDenied) {
                  Alert.alert(
                    "Permission required",
                    "Please enable microphone and phone permissions in app settings.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Open settings",
                        onPress: () => Linking.openSettings(),
                      },
                    ],
                  );
                }
                return;
              }
            }
            permitAnswerCallsRef.current = value;
            setPermitAnswerCall(value);
            updateSettingsInStorage("permitAnswerCalls", value);
          }}
          thumbColor={Colors.primaryTint90}
          trackColor={{
            true: Colors.primaryTint40,
          }}
        />
      </View>
      <View style={dividerLine}></View>
      <BrokenMic />
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
    lineHeight: 18,
  },
});
