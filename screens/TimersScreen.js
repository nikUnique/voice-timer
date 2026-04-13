/* eslint-disable react-native/no-raw-text */
import { memo } from "react";
import { StyleSheet } from "react-native";
import Timers from "../components/Timers";

function TimersScreen({ navigation }) {
  return (
    <>
      <Timers navigation={navigation} />
    </>
  );
}

export default memo(TimersScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // position: "absolute",
  },
});
