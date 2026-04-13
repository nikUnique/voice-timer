import { StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";

export default function Section({ children }) {
  return (
    <View>
      <Text style={styles.section}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    color: Colors.primaryTint90,
    marginBottom: 12,
    fontSize: 16,
  },
});
