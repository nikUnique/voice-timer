import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

export function Subtitle({ children }) {
  return (
    <View>
      <Text style={styles.subtitle}>{children}</Text>
    </View>
  );
}

export function Paragraph({ children }) {
  return (
    <View>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  );
}

export function Label({ children }) {
  return (
    <View>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

export function BulletPoint({ children }) {
  return (
    <View style={styles.bulletPointContainer}>
      <Text style={styles.bulletPoint}>
        {"\u2022  "}
        {children + "\n"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.primaryTint90,
  },

  paragraph: {
    color: Colors.primaryTint90,
    fontSize: 16,
    marginBottom: 12,
  },

  label: {
    color: Colors.primaryTint90,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 600,
  },

  bulletPoint: {
    color: Colors.primaryTint90,
    fontSize: 16,
  },

  bulletPointContainer: {
    // marginBottom: 8,
  },
});
