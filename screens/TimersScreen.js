/* eslint-disable react-native/no-raw-text */
import { memo, useEffect, useState } from "react";
import Timers from "../components/Timers";
import { getItemFromStorage } from "../utils/helpers";
import { Alert, BackHandler, Button, StyleSheet, View } from "react-native";
import Dialog from "react-native-dialog";

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
