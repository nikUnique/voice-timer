import { StyleSheet, View } from "react-native";
import { SPACE } from "../constants/spacing";

export default function Section({ children }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACE.xxl,
  },
});
