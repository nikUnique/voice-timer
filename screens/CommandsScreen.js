import { StyleSheet, View } from "react-native";
import Commands from "../components/Commands";

function CommandsScreen() {
  return (
    <View style={styles.container}>
      <Commands />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommandsScreen;
