import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../constants/colors";
import { useRefsData } from "../context/VoiceRecognizerContext";
import IconButton from "../ui/IconButton";
import { emitter } from "../utils/EventEmitter";
import { getSharedObject } from "../utils/sharedVariables";

export default function TimerInterfaceButtons({ onDelete }) {
  const navigation = useNavigation();

  const [stateChanged, setStateChanged] = useState(false);

  const { timers, workingTimersRef } = useRefsData();
  const thereAre30Timers = timers.length >= 30;

  useEffect(
    function () {
      emitter.all.delete(`timerInterfaceButtonsUpdate`);
      emitter.on(`timerInterfaceButtonsUpdate`, () => {
        setStateChanged((prev) => !prev);
      });
    },
    [setStateChanged]
  );

  async function onPress() {
    !getSharedObject().alertingTimers.length &&
      navigation.push("CreateTimerScreen");
  }

  const isTimerStopped =
    getSharedObject().isPaused || !getSharedObject().isActive;

  return (
    <View style={styles.btnsContainer}>
      <View
        style={[
          styles.sideButtonContainer,
          getSharedObject().isActive && styles.disabledDeleteBtn,
        ]}
      >
        <IconButton
          size={36}
          icon='trash'
          color={Colors.primaryTint90}
          onPress={() =>
            onDelete(getSharedObject().name || timers[timers.length - 1].name)
          }
          style={styles.deleteButton}
        />
      </View>

      <View style={styles.playButtonContainer}>
        <IconButton
          size={36}
          icon={isTimerStopped ? "play" : "pause"}
          onPress={() =>
            emitter.emit(
              `controlTimer-${getSharedObject()?.name || timers[timers.length - 1].name}`
            )
          }
          color={Colors.primaryTint90}
          style={[
            styles.playButton,
            workingTimersRef.current.length >= 5 &&
              !getSharedObject().isActive &&
              styles.disabledDeleteBtn,
          ]}
        />
      </View>

      {
        <View
          style={[
            styles.iconContainer,
            thereAre30Timers && styles.hiddenButton,
          ]}
        >
          <IconButton
            icon='add'
            color={Colors.primaryTint90}
            onPress={onPress}
            size={36}
            style={styles.icon}
          />
        </View>
      }
      {
        // <IconButton
        //   icon='add'
        //   color={Colors.primaryTint90}
        //   onPress={() => NativeModules.NativeUtilsModule.crashApp()}
        //   size={36}
        //   style={styles.icon}
        // />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    borderRadius: "50%",
    backgroundColor: Colors.whiteAlpha20,
    padding: 16,
  },

  disabledDeleteBtn: {
    opacity: 0.5,
    pointerEvents: "none",
  },

  playButton: {
    borderRadius: "50%",
    backgroundColor: Colors.whiteAlpha20,
    padding: 24,
  },

  hiddenButton: {
    opacity: 0,
    pointerEvents: "none",
  },

  btnsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: 48,
  },

  icon: {
    padding: 16,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: "50%",
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
