import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
} from "../context/VoiceRecognizerContext";
import IconButton from "../ui/IconButton";
import { resetTimerEmitter } from "../utils/EventEmitter";
import { getSharedObject } from "../utils/sharedVariables";

const { width, height } = Dimensions.get("window");

const AlarmOverlay = ({ navigation }) => {
  const [currentActivity, setCurrentActivity] = useState("");

  const { alertingTimerNames } = useRecognizerData();

  const { currentActivityRef } = useRefsData();

  useEffect(
    function () {
      if (alertingTimerNames.length === 0) {
        navigation.goBack();
      }
    },
    [alertingTimerNames, navigation],
  );

  const onDismiss = useCallback(function () {
    getSharedObject().alertingTimerNames.map((alertingTimer) =>
      resetTimerEmitter.emit(`reset ${alertingTimer}`),
    );
    navigation.goBack();
  }, []);

  useEffect(
    function () {
      async function load() {
        const activity =
          await NativeModules.NativeUtilsModule.getCurrentActivityName();

        setCurrentActivity(activity);
      }
      load();
    },
    [currentActivity, currentActivityRef],
  );

  return (
    <>
      <View
        style={{
          opacity: getSharedObject().alertingTimerNames?.length > 0 ? 0 : 100,
        }}
      ></View>
      <View
        style={[
          styles.wrapper,
          !getSharedObject().alertingTimerNames.length === 0 && { opaicty: 1 },
        ]}
        pointerEvents='auto'
      >
        <View style={styles.overlay}>
          {getSharedObject().alertingTimerNames?.map((timer) => (
            <View
              key={Math.random()}
              style={styles.timerContainer}
            >
              <View style={styles.titleBox}>
                <Text style={styles.title}>
                  {timer}
                  {` is up`}!
                </Text>
                <View style={styles.icon}>
                  <IconButton
                    icon='notifications'
                    size={24}
                    color={Colors.primaryTint90}
                  />
                </View>
              </View>
            </View>
          ))}

          {getSharedObject().alertingTimerNames.length > 0 && (
            <Pressable
              style={styles.button}
              onPress={() => {
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: width,
    minHeight: height,
    zIndex: 9999,
    backgroundColor: Colors.primary,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    backgroundColor: Colors.primaryShade30,
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    width: "80%",
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primaryTint90,
  },
  titleBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: {
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: Colors.whiteAlpha20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: Colors.primaryTint90,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AlarmOverlay;
