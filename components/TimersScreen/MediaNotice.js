import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { memo, useCallback, useState } from "react";
import { NativeModules, StyleSheet, View } from "react-native";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import { Text } from "../../ui/AppText";
import { COMMANDS_RUNTIME_POLL_MS } from "../../utils/config";

// Slim banner for the media-playing state. While media plays it outranks
// sleep: almost every spoken command is refused until the media is paused, so
// this is the only notice shown. It states the fact and stops - the per-command
// detail lives on the Commands screen. Like sleep it is state, not a banner to
// dismiss: it clears when playback stops. Kept at the original 70% width so it
// clears the corner pagination counter instead of sitting underneath it.
function MediaNotice({ onMediaPlayingChange }) {
  const [mediaPlaying, setMediaPlaying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refresh = function () {
        Promise.resolve(
          NativeModules.AudioFocusModule?.isMediaPlaying?.(),
        ).then((playing) => {
          if (!isActive) return;
          const next = Boolean(playing);
          onMediaPlayingChange?.(next);
          setMediaPlaying((current) => (current === next ? current : next));
        });
      };

      refresh();
      const pollId = setInterval(refresh, COMMANDS_RUNTIME_POLL_MS);

      return function () {
        isActive = false;
        clearInterval(pollId);
      };
    }, [onMediaPlayingChange]),
  );

  if (!mediaPlaying) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.banner}>
        <Ionicons
          name="musical-notes"
          size={FONT.subheading}
          color={Colors.pausedColor}
        />
        <View style={styles.textColumn}>
          <Text style={styles.title}>Media is playing</Text>
          <Text style={styles.subtitle}>Most voice commands are paused</Text>
        </View>
      </View>
    </View>
  );
}

export default memo(MediaNotice);

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
