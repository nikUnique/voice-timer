import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import { Text } from "../../ui/AppText";

// Slim banner for the sleep state. While media plays the media notice outranks
// this one, so the caller hides it then. It states the fact and stops - the
// per-command detail lives on the Commands screen. State, not a banner to
// dismiss: it clears when the timer wakes. Kept at the original 70% width so it
// clears the corner pagination counter instead of sitting underneath it.
function SleepNotice({ isTimerSleeping, hidden }) {
  if (hidden || !isTimerSleeping) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.banner}>
        <Ionicons
          name="moon"
          size={FONT.subheading}
          color={Colors.pausedColor}
        />
        <View style={styles.textColumn}>
          <Text style={styles.title}>Timer is sleeping</Text>
          <Text style={styles.subtitle}>Most voice commands are paused</Text>
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
  banner: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.lg,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.pausedAlpha20,
    borderWidth: 1,
    borderColor: Colors.pausedColor,
  },
  textColumn: {
    flex: 1,
    gap: SPACE.xs,
  },
  title: {
    color: Colors.pausedColor,
    fontSize: FONT.body,
    fontWeight: WEIGHT.bold,
  },
  subtitle: {
    color: Colors.primaryTint90,
    fontSize: FONT.caption,
  },
});
