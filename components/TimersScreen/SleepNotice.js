import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { memo, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { ExpandableSetting } from "../../ui/ExpandableSetting";
import * as defaultCommands from "../../utils/en_commands";

function SleepNotice({ isTimerSleeping }) {
  const { commandsRef } = useRefsData();
  const { isSkipCommandsEnabledRef } = useSettingsData();

  // Skip commands are toggled through a ref (see Settings), so keep a local
  // state in sync on focus, mirroring the pattern used by useCommandsList.
  const [isSkipEnabled, setIsSkipEnabled] = useState(
    () => isSkipCommandsEnabledRef?.current ?? false,
  );

  useFocusEffect(
    useCallback(() => {
      setIsSkipEnabled(isSkipCommandsEnabledRef?.current ?? false);
    }, [isSkipCommandsEnabledRef]),
  );

  // Commands are loaded asynchronously into a ref, so fall back to the
  // bundled English commands until the active set is available.
  const commands = commandsRef?.current ?? defaultCommands;

  const {
    TIMER_WAKE_UP = "",
    STOP = "",
    STOP_FINISHED = "",
    PLAY_MEDIA = "",
    STOP_MEDIA = "",
    ANSWER_CALL = "",
    SKIP_NEXT = "",
    SKIP_PREVIOUS = "",
  } = commands;

  if (!isTimerSleeping) {
    return null;
  }

  // Skip next/previous keep working while sleeping, but only while media is
  // playing and only when enabled in Settings (handled before the sleep block).
  const extraCommands = isSkipEnabled
    ? `, ${SKIP_NEXT}, ${SKIP_PREVIOUS} (while media is playing)`
    : "";

  const description = `Most voice commands will not work. Still available: ${TIMER_WAKE_UP}, ${STOP} [timer name], ${STOP_FINISHED}, ${PLAY_MEDIA}, ${STOP_MEDIA}, ${ANSWER_CALL}${extraCommands}.`;

  return (
    <View
      style={styles.container}
      pointerEvents='box-none'
    >
      <View style={styles.card}>
        <Ionicons
          name='moon'
          size={FONT.heading}
          color={Colors.pausedColor}
          style={styles.icon}
        />

        <View style={styles.body}>
          <ExpandableSetting
            label='Timer is sleeping'
            labelStyle={styles.title}
            descriptionStyle={styles.text}
            description={description}
            collapsedLines={2}
            style={styles.expandable}
          />
        </View>
      </View>
    </View>
  );
}

export default memo(SleepNotice);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: SPACE.sm,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  card: {
    width: "70%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.lg,
    padding: SPACE.lg,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.pausedAlpha20,
    borderWidth: 1,
    borderColor: Colors.pausedColor,
  },
  icon: {
    marginTop: SPACE.xs,
  },
  body: {
    flex: 1,
  },
  expandable: {
    width: "100%",
  },
  title: {
    color: Colors.pausedColor,
    fontSize: FONT.body,
    fontWeight: WEIGHT.bold,
    marginBottom: SPACE.xs,
  },
  text: {
    color: Colors.primaryTint90,
    fontSize: FONT.caption,
    lineHeight: FONT.caption * 1.4,
  },
});
