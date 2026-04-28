import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { useResponsive } from "../hooks/useResponsive";

export function Subtitle({ children }) {
  const { t } = useResponsive();
  const styles = StyleSheet.create({
    subtitle: {
      fontSize: t.heading,
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
  const { t } = useResponsive();
  const styles = StyleSheet.create({
    paragraph: {
      color: Colors.primaryTint90,
      fontSize: t.subheading,
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
  const { t } = useResponsive();
  const styles = StyleSheet.create({
    label: {
      color: Colors.primaryTint90,
      marginBottom: 8,
      fontSize: t.subheading,
      fontWeight: 600,
    },
  });

  return (
    <View>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

export function BulletPoint({ children }) {
  const { t } = useResponsive();

  const styles = StyleSheet.create({
    bulletPoint: {
      color: Colors.primaryTint90,
      fontSize: t.subheading,
    },
  });

  return (
    <View style={styles.bulletPointContainer}>
      <Text style={styles.bulletPoint}>
        {"\u2022 "}
        {children + "\n"}
      </Text>
    </View>
  );
}
