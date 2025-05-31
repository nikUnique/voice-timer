import React from "react";
import { StyleSheet, View } from "react-native";

import CreateTimer from "../components/CreateTimer";

function CreateTimerScreen({ navigation }) {
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
