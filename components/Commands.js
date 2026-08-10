import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import { useResponsive } from "../hooks/useResponsive";
import LoadingIndicator from "../ui/LoadingIndicator";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { capitalize } from "../utils/helpers";
import { FONT } from "../constants/typography";
import { WEIGHT } from "../constants/weight";
import { SPACE } from "../constants/spacing";
import { RADIUS } from "../constants/radius";

export default memo(function Commands() {
  const [ready, setReady] = useState(false);

  const { commandsRef } = useRefsData();

  const {
    REPEAT,
    STOP,
    STOP_FINISHED,
    TIME,
    START,
    PAUSE,
    PLAY_MEDIA,
    STOP_MEDIA,
    RESUME,
    STATUS_REPORT,
    STATUS,
    TIMER_WAKE_UP,
    TIMER_GO_SLEEP,
    VOLUME_UP,
    VOLUME_DOWN,
  } = commandsRef?.current ? commandsRef.current : {};

  const commands = useMemo(() => {
    return [
      {
        command: `${capitalize(START)} [timer name]`,
        example: `${capitalize(START)} Focus timer`,
        description: "Starts the named timer with its default duration.",
        icon: "play-outline",
        badge: "START",
      },
      {
        command: `${capitalize(PAUSE)} [timer name]`,
        example: `${capitalize(PAUSE)} Focus timer`,
        description: "Pauses the timer if it is running, otherwise no effect.",
        icon: "pause-outline",
        badge: "PAUSE",
      },
      {
        command: `${capitalize(RESUME)} [timer name]`,
        example: `${capitalize(RESUME)} Focus timer`,
        description:
          'Resumes the timer if paused. "Resume" is avoided as it can be misheard as "STOP".',
        icon: "play-skip-forward-outline",
        badge: "RESUME",
      },
      {
        command: `${capitalize(STOP)} [timer name]`,
        example: `${capitalize(STOP)} Focus timer`,
        description: "Stops the timer if it was paused, otherwise no effect.",
        icon: "refresh-outline",
        badge: "STOP",
      },
      {
        command: `${capitalize(REPEAT)}`,
        example: `${capitalize(REPEAT)}`,
        description:
          "Restarts the timer from the last individual timer command. Any command that used a specific timer counts - that timer will be restarted. E.g. if you last said 'start twenty minutes' or 'STOP twenty minutes', where 'twenty minutes' is one of your timers, saying 'Repeat' restarts the 'twenty-minutes' timer.",
        icon: "repeat-outline",
        badge: "REPEAT",
      },
      {
        command: `${capitalize(STOP_FINISHED)}`,
        example: `${capitalize(STOP_FINISHED)}`,
        description: "STOPs all timers that have run out of time.",
        icon: "checkmark-done-outline",
        badge: "BULK",
      },
      {
        command: `${capitalize(TIME)}`,
        example: `${capitalize(TIME)}`,
        description: "Tells you the exact time.",
        icon: "time-outline",
        badge: "TIME",
      },
      {
        command: `${capitalize(PLAY_MEDIA)}`,
        example: `${capitalize(PLAY_MEDIA)}`,
        description: `Resumes external media playback. While media is playing, only the "${capitalize(STOP_MEDIA)}" command is accepted - all other commands are ignored.`,
        icon: "play-circle-outline",
        badge: "PLAY",
      },
      {
        command: `${capitalize(STOP_MEDIA)}`,
        example: `${capitalize(STOP_MEDIA)}`,
        description:
          "Pauses external media and restores full voice control. Required before any other command will be accepted - while media is playing, this is the only command that works.",
        icon: "stop-circle-outline",
        badge: "STOP",
      },
      {
        command: `${capitalize(STATUS_REPORT)}`,
        example: `${capitalize(STATUS_REPORT)}`,
        description:
          "Reads out all timers and their current state - how many are running, paused, alarming, or not active.",
        icon: "list-outline",
        badge: "STATUS",
      },
      {
        command: `${capitalize(STATUS)} [timer name]`,
        example: `${capitalize(STATUS)} Focus timer`,
        description:
          "Reads the current state of a single timer - whether it is running, paused, alarming, or not active, and how much time is left.",
        icon: "timer-outline",
        badge: "STATUS",
      },
      {
        command: `${capitalize(TIMER_WAKE_UP)}`,
        example: `${capitalize(TIMER_WAKE_UP)}`,
        description:
          "Activates voice command listening. Timer will now respond to spoken commands.",
        icon: "mic-outline",
        badge: "WAKE",
      },
      {
        command: `${capitalize(TIMER_GO_SLEEP)}`,
        example: `${capitalize(TIMER_GO_SLEEP)}`,
        description:
          "Deactivates voice command listening. Timer will stop responding to spoken commands until woken up again. 'Stop all media' and 'play all media' still work while sleeping. Say 'timer wake up' to resume commands.",
        icon: "mic-off-outline",
        badge: "SLEEP",
      },
      {
        command: `${capitalize(VOLUME_UP)}`,
        example: `${capitalize(VOLUME_UP)}`,
        description: "Increases media volume by one step.",
        icon: "volume-high-outline",
        badge: "VOL+",
      },
      {
        command: `${capitalize(VOLUME_DOWN)}`,
        example: `${capitalize(VOLUME_DOWN)}`,
        description: "Decreases media volume by one step.",
        icon: "volume-low-outline",
        badge: "VOL-",
      },
    ];
  }, [
    RESUME,
    PAUSE,
    PLAY_MEDIA,
    REPEAT,
    STOP,
    STOP_FINISHED,
    START,
    STATUS,
    STATUS_REPORT,
    STOP_MEDIA,
    TIME,
    TIMER_GO_SLEEP,
    TIMER_WAKE_UP,
    VOLUME_DOWN,
    VOLUME_UP,
  ]);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const title = {
    fontSize: FONT.heading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
    marginBottom: SPACE.xl,
  };
  const subtitle = {
    fontSize: FONT.subheading,
    color: Colors.primaryTint70,
    marginBottom: SPACE.xxl,
  };

  const renderItem = useCallback(function ({ item }) {
    const { icon, badge, command, example, description } = item;
    const badgeText = {
      fontSize: FONT.caption,
      letterSpacing: 1.1,
      color: Colors.primaryTint40,
    };

    const commandText = {
      fontSize: FONT.body,
      fontWeight: WEIGHT.semibold,
      color: Colors.primaryTint90,
    };

    const exampleText = {
      fontSize: FONT.caption,

      color: Colors.primaryTint8,
    };

    const descriptionText = {
      fontSize: FONT.caption,
      color: Colors.grayTint20,
      lineHeight: 18,
    };

    return (
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name={icon}
            size={18}
            color={Colors.primaryTint40}
          />
        </View>
        <View style={styles.body}>
          <View style={styles.badge}>
            <Text style={badgeText}>{badge}</Text>
          </View>
          <Text style={commandText}>{command}</Text>
          {example && (
            <Text style={exampleText}>
              <Text style={styles.prompt}>&gt; </Text>&quot;{example}&quot;
            </Text>
          )}
          <Text style={descriptionText}>{description}</Text>
        </View>
      </View>
    );
  }, []);

  const Header = useMemo(
    () => (
      <>
        <Text style={title}>Voice Commands</Text>
        <Text style={subtitle}>
          Use the following voice commands to control the timer hands-free.
        </Text>
      </>
    ),
    [],
  );

  return ready ? (
    <View style={styles.container}>
      <FlatList
        data={commands}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.command}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
      />
    </View>
  ) : (
    <LoadingIndicator />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACE.xl,
  },

  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.primaryShade50, // #092e34
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary, // #0b7285
    paddingVertical: SPACE.xl,
    paddingRight: SPACE.xl,
    paddingLeft: SPACE.lg,
    flexDirection: "row",
    gap: SPACE.xl,
    marginBottom: SPACE.lg,
  },
  body: {
    flex: 1,
    gap: SPACE.sm,
  },
  commandItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACE.xl,
    marginBottom: SPACE.lg,
    backgroundColor: Colors.grayShade20,
    borderRadius: RADIUS.sm,
    borderWidth: 0.5,
    borderColor: Colors.whiteAlpha10,
    gap: SPACE.lg,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.primaryTint8Alpha15,
    borderWidth: 1,
    borderColor: Colors.primaryTint8Alpha30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACE.xs,
  },
  textContainer: {
    flex: 1,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primaryTint40Alpha40,
    borderRadius: RADIUS.tight,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    backgroundColor: Colors.primaryTint40Alpha8,
    marginBottom: SPACE.xs,
  },
  badgeWrap: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryTint8,
    borderRadius: RADIUS.tight,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    marginBottom: SPACE.md,
  },
  prompt: {
    color: Colors.primaryShade30,
    fontWeight: WEIGHT.bold,
    fontSize: FONT.body,
  },
});
