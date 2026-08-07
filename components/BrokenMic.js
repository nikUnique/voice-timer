import { memo } from "react";
import { Platform, StyleSheet, Switch, UIManager, View } from "react-native";

import { Colors } from "../constants/colors";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { ExpandableSetting } from "../ui/ExpandableSetting";

export default memo(function BrokenMic() {
  const { setting, settingLabel, switchBox, settingDescription } =
    useSettingsStyles();

  const { isHeadsetBroken, setIsHeadsetBroken } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  const { commandsRef } = useRefsData();

  const { STOP_MEDIA, PLAY_MEDIA } = commandsRef?.current
    ? commandsRef.current
    : {};

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <View style={[switchBox, setting]}>
      {/* <View style={styles.container}>
        <Text style={settingLabel}>Ignore hardware media button events</Text>
        <Text
          style={settingDescription}
          numberOfLines={expanded ? undefined : 2}
        >
          Useful if your headset&apos;s physical buttons are broken and
          misfiring, causing unwanted pause/resume.{"\n\n"}
          If you also enabled a similar setting in your media app, turn this on
          too - the app will then pause/resume external media by requesting and
          releasing audio focus instead of sending button commands.{"\n\n"}
          Note: if this setting is on, and you paused media using &quot;
          {STOP_MEDIA}&quot;, then fully closing or killing this app will cause
          the paused media to resume on its own. Also, you can resume with{" "}
          &quot;{PLAY_MEDIA}&quot;, only if you paused using the &quot;
          {STOP_MEDIA}&quot; command. Otherwise, you won&apos;t be able to
          resume with the &quot;
          {PLAY_MEDIA}&quot; command.
        </Text>
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setExpanded((prev) => !prev);
          }}
        >
          <Text style={styles.toggleText}>
            {expanded ? "Show less" : "Show more"}
          </Text>
        </Pressable>
      </View> */}
      <ExpandableSetting
        label='Ignore hardware media button events'
        labelStyle={settingLabel}
        descriptionStyle={settingDescription}
        description={`Useful if your headset's physical buttons are broken and misfiring, causing unwanted pause/resume.\n\nIf you also enabled a similar setting in your media app, turn this on too - the app will then pause/resume external media by requesting and releasing audio focus instead of sending button commands.\n\nNote: if this setting is on, and you paused media using "${STOP_MEDIA}", then fully closing or killing this app will cause the paused media to resume on its own. Also, you can resume with ${PLAY_MEDIA}, only if you paused using a command. Otherwise, you won't be able to resume with the "${PLAY_MEDIA}" command.`}
      />

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
  container: {
    width: "90%",
  },
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
  toggleText: {
    color: Colors.primaryTint70,
    fontWeight: 600,
  },
});
