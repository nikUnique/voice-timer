import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { useResponsive } from "../hooks/useResponsive";
import LoadingIndicator from "../ui/LoadingIndicator";

const commands = [
  {
    command: "Start [timer name]",
    example: "Start Focus timer",
    description: "Starts the named timer with its default duration.",
    icon: "play-outline",
    badge: "START",
  },
  {
    command: "Pause [timer name]",
    example: "Pause Focus timer",
    description: "Pauses the timer if it is running, otherwise no effect.",
    icon: "pause-outline",
    badge: "PAUSE",
  },
  {
    command: "Continue [timer name]",
    example: "Continue Focus timer",
    description:
      'Resumes the timer if paused. "Resume" is avoided as it can be misheard as "Reset".',
    icon: "play-skip-forward-outline",
    badge: "CONTINUE",
  },
  {
    command: "Reset [timer name]",
    example: "Reset Focus timer",
    description: "Resets the timer if it was paused, otherwise no effect.",
    icon: "refresh-outline",
    badge: "RESET",
  },
  {
    command: "Repeat",
    example: "Repeat",
    description:
      "Restarts the timer from the last individual timer command. Any command that used a specific timer counts - that timer will be restarted. E.g. if you last said 'start twenty minutes' or 'reset twenty minutes', where 'twenty minutes' is one of your timers, saying 'Repeat' restarts the 'twenty-minutes' timer.",
    icon: "repeat-outline",
    badge: "REPEAT",
  },
  {
    command: "Reset finished",
    example: "Reset finished",
    description: "Resets all timers that have run out of time.",
    icon: "checkmark-done-outline",
    badge: "BULK",
  },
  {
    command: "Time",
    example: "Time",
    description: "Tells you the exact time.",
    icon: "time-outline",
    badge: "TIME",
  },
  {
    command: "Play media",
    example: "Play media",
    description:
      "Resumes external media playback. While media is playing, only the 'Stop media' command is accepted - all other commands are ignored.",
    icon: "play-circle-outline",
    badge: "PLAY",
  },
  {
    command: "Stop media",
    example: "Stop media",
    description:
      "Pauses external media and restores full voice control. Required before any other command will be accepted - while media is playing, this is the only command that works.",
    icon: "stop-circle-outline",
    badge: "STOP",
  },
  {
    command: "Status report",
    example: "Status report",
    description:
      "Reads out all timers and their current state - how many are running, paused, alarming, or not active.",
    icon: "list-outline",
    badge: "STATUS",
  },
  {
    command: "Status [timer name]",
    example: "Status Focus timer",
    description:
      "Reads the current state of a single timer - whether it is running, paused, alarming, or not active, and how much time is left.",
    icon: "timer-outline",
    badge: "STATUS",
  },
];

export default memo(function Commands() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const { t } = useResponsive();

  const title = {
    fontSize: t.heading,
    fontWeight: "600",
    color: Colors.primaryTint90,
    marginBottom: 16,
  };
  const subtitle = {
    fontSize: t.subheading,
    color: Colors.primaryTint70,
    marginBottom: 20,
  };

  const renderItem = useCallback(
    function ({ icon, badge, command, example, description }) {
      const badgeText = {
        fontFamily: "JetBrainsMono", // or your monospace font
        fontSize: t.label,
        letterSpacing: 1.1,
        color: Colors.primaryTint40,
      };

      const commandText = {
        fontSize: t.body,
        fontWeight: "600",
        color: Colors.primaryTint90,
      };

      const exampleText = {
        fontSize: t.caption,

        fontFamily: "JetBrainsMono",

        color: Colors.primaryTint8,
      };

      const descriptionText = {
        fontSize: t.caption,
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
    },
    [t.body, t.caption, t.label],
  );

  return ready ? (
    <View style={styles.container}>
      <FlatList
        data={commands}
        renderItem={({ item }) => renderItem(item)}
        ListHeaderComponent={
          <>
            <Text style={title}>Voice Commands</Text>
            <Text style={subtitle}>
              Use the following voice commands to control the timer hands-free.
            </Text>
          </>
        }
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.command}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  ) : (
    <LoadingIndicator />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.primaryShade50, // #092e34
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary, // #0b7285
    paddingVertical: 14,
    paddingRight: 16,
    paddingLeft: 13,
    flexDirection: "row",
    gap: 14,
    marginBottom: 10,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  commandItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.grayShade20,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.whiteAlpha10,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryTint8Alpha15,
    borderWidth: 1,
    borderColor: Colors.primaryTint8Alpha30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primaryTint40Alpha40,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Colors.primaryTint40Alpha8,
    marginBottom: 1,
  },
  badgeWrap: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryTint8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: 6,
  },
  prompt: {
    color: Colors.primaryShade30,
    fontWeight: "700",
    fontSize: 14,
  },
});
