import { StyleSheet, View } from "react-native";

export default function Section({ children }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});
