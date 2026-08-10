import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { useResponsive } from "../hooks/useResponsive";
import { FONT } from "../constants/typography";

export function Subtitle({ children }) {
  const styles = StyleSheet.create({
    subtitle: {
      fontSize: FONT.heading,
      fontWeight: "bold",
      marginBottom: 12,
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
      marginBottom: 12,
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
      marginBottom: 8,
      fontSize: FONT.subheading,
      fontWeight: 600,
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
      marginLeft: nested ? 16 : 0,
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
