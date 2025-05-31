import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

export default function Commands() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Voice Commands</Text>
      <Text style={styles.description}>
        Use the following voice commands to control the timer hands-free:
      </Text>
      <ScrollView style={styles.list}>
        {commands.map(({ command, example, description }, index) => (
          <View key={index} style={styles.commandItem}>
            <Ionicons
              name='information-circle-outline'
              size={24}
              color={Colors.primaryTint90}
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.command}>{command}</Text>
              {example && (
                <Text style={styles.example}>Example: {example}</Text>
              )}
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const commands = [
  {
    command: "Start [timer name]",
    example: "Start Focus timer",
    description: "Starts the Focus timer with the default duration.",
    icon: "play-outline",
  },

  {
    command: "Pause [timer name]",
    example: "Pause Focus timer",
    description:
      "Pauses the Focus timer if it was running, otherwise no effect produced.",
    icon: "play-outline",
  },

  {
    command: "Continue [timer name]",
    example: "Continue Focus timer",
    description:
      "Resumes the Focus timer if it was paused, otherwise no effect produced. Resume command is not used because it can be recognized as 'Reset' sometimes.",
    icon: "play-outline",
  },

  {
    command: "Reset [timer name]",
    example: "Reset Focus timer",
    description:
      "Resets the Focus timer if it was paused, otherwise no effect produced.",
    icon: "play-outline",
  },

  {
    command: "Repeat",
    example: "Repeat",
    description:
      "Restarts the timer mentioned in the most recent command where a timer name was used. Works only if the timer is inactive.",
    icon: "play-outline",
  },

  {
    command: "Reset finished",
    example: "Reset finished",
    description:
      "Resets all timers that have run out of time. Only affects timers whose time is up.",
    icon: "play-outline",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.primary,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.primaryTint90,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    color: Colors.primaryTint90,
  },
  list: {
    marginTop: 8,
  },
  commandItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.primaryShade30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryTint90,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  command: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primaryTint90,
  },
  example: {
    fontSize: 16,
    fontStyle: "italic",
    color: Colors.primaryTint90,
    marginBottom: 4,
  },
});
