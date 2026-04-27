import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

export default function Commands() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voice Commands</Text>
      <Text style={styles.subtitle}>
        Use the following voice commands to control the timer hands-free.
      </Text>
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {commands.map(
          ({ command, example, description, icon, badge }, index) => (
            <View
              key={index}
              style={styles.commandItem}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name={icon}
                  size={20}
                  color={Colors.primaryTint40}
                />
              </View>
              <View style={styles.textContainer}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.badge}>{badge}</Text>
                </View>
                <Text style={styles.command}>{command}</Text>
                {example && <Text style={styles.example}>"{example}"</Text>}
                <Text style={styles.description}>{description}</Text>
              </View>
            </View>
          ),
        )}
      </ScrollView>
    </View>
  );
}

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
      "Restarts the timer from the most recent command. Only works if the timer is inactive.",
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
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: Colors.grayShade30,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.primaryTint90,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primaryTint70,
    marginBottom: 20,
    lineHeight: 19,
  },
  list: {
    flex: 1,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryShade30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  badgeWrap: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryTint8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: 6,
  },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primaryTint70,
    letterSpacing: 0.5,
  },
  command: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryTint90,
    marginBottom: 3,
  },
  example: {
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.primaryTint40,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.grayTint20,
    lineHeight: 18,
  },
});
