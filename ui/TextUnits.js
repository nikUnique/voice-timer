import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { SPACE } from "../constants/spacing";
import { FONT } from "../constants/typography";
import { WEIGHT } from "../constants/weight";

export function Subtitle({ children }) {
  const styles = StyleSheet.create({
    subtitle: {
      fontSize: FONT.heading,
      fontWeight: WEIGHT.bold,
      marginBottom: SPACE.lg,
      color: Colors.primaryTint90,
    },
  });

  return (
    <View>
      <Text style={styles.subtitle}>{children}</Text>
    </View>
  );
}

export function Paragraph({ children }) {
  const styles = StyleSheet.create({
    paragraph: {
      color: Colors.primaryTint90,
      fontSize: FONT.subheading,
      marginBottom: SPACE.lg,
    },
  });

  return (
    <View>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  );
}

export function Label({ children }) {
  const styles = StyleSheet.create({
    label: {
      color: Colors.primaryTint90,
      marginBottom: SPACE.md,
      fontSize: FONT.subheading,
      fontWeight: WEIGHT.semibold,
    },
  });

  return (
    <View>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

export function BulletPoint({ children, nested = false }) {
  const styles = StyleSheet.create({
    bulletPointContainer: {
      flexDirection: "row",
      marginLeft: nested ? SPACE.lg : 0,
    },
    bulletPoint: {
      width: 16,
    },
    text: {
      color: Colors.primaryTint90,
      fontSize: FONT.subheading,
    },
  });

  return (
    <View style={styles.bulletPointContainer}>
      <Text style={[styles.bulletPoint, styles.text]}>{"\u2022 "}</Text>
      <Text style={styles.text}>{children + "\n"}</Text>
    </View>
  );
}
