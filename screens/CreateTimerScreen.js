import { StyleSheet, View } from "react-native";

import CreateTimer from "../components/CreateTimerScreen/CreateTimer";

function CreateTimerScreen() {
  return (
    <View style={styles.container}>
      <CreateTimer />
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

export default CreateTimerScreen;
