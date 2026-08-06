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

export default memo(function AppBehavior() {
  const { setting, settingLabel, switchBox } = useSettingsStyles();

  const { isHeadsetBroken, setIsHeadsetBroken } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  const { commandsRef } = useRefsData();

  const { STOP_MEDIA, PLAY_MEDIA } = commandsRef?.current
    ? commandsRef.current
    : {};

  return (
    <View style={[switchBox, setting]}>
      <Text style={settingLabel}>
        Ignore hardware media button events. Useful if your headset&apos;s
        physical buttons are broken and misfiring, causing unwanted
        pause/resume.{"\n\n"}
        If you also enabled a similar setting in your media app, turn this on
        too - the app will then pause/resume external media by requesting and
        releasing audio focus instead of sending button commands.{"\n\n"}
        Note: if this setting is on, and you paused media using &quot;
        {STOP_MEDIA}&quot;, then fully closing or killing this app will cause
        the paused media to resume on its own. Also, you can resume with{" "}
        {PLAY_MEDIA}, only if you paused using a command. Otherwise, you
        won&apos;t be able to resume with the &quot;{PLAY_MEDIA}&quot; command.
      </Text>

      <Switch
        value={isHeadsetBroken}
        onValueChange={(value) => {
          setIsHeadsetBroken(value);
          updateSettingsInStorage("isHeadsetBroken", value);
        }}
        thumbColor={Colors.primaryTint90}
        trackColor={{
          true: Colors.primaryTint40,
        }}
      />
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
