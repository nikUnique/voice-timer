import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { useRefsData } from "../context/VoiceRecognizerContext";
import IconButton from "../ui/IconButton";
import { emitter } from "../utils/EventEmitter";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

let isTimerStopped = true;

export default function TimerInterfaceButtons({ onDelete }) {
  const navigation = useNavigation();

  const [stateChanged, setStateChanged] = useState(false);
  const [maximumTimersTipCreation, setMaximumTimersTipCreation] =
    useState(false);
  const [maximumTimersTipStart, setMaximumTimersTipStart] = useState(false);

  const createButtonTipTimeoutRef = useRef(null);
  const startButtonTipTimeoutRef = useRef(null);

  const { timers, workingTimersRef, leastTimeTimerRef } = useRefsData();
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

  // useEffect(
  //   function () {
  //     if (!getSharedObject().name) {
  //       const isSelectedTimerPaused = leastTimeTimerRef.current?.isPaused;

  //       if (leastTimeTimerRef.current && !isSelectedTimerPaused) {
  //         updateSharedObject({ isPaused: false, isActive: true });
  //       }
  //     }
  //   },
  //   [leastTimeTimerRef, stateChanged]
  // );

  // console.log("state", stateChanged);

  // useEffect(function () {
  //   updateSharedObject({ name: timers[timers.length - 1]?.name });
  //   setStateChanged((prev) => !prev);
  // }, []);

  useEffect(function () {
    console.log("The name is: ", getSharedObject()?.name, "💣");
    // if (
    //   getSharedObject()?.runningTimers.includes(timers[timers.length - 1].name)
    // ) {
    //   isTimerStopped = false;
    // }

    return () => {
      console.log("We should already clean the name 📷");
      updateSharedObject({ name: null });
    };
  }, []);

  async function onPress() {
    if (workingTimersRef.current.length >= 5) {
      clearTimeout(startButtonTipTimeoutRef.current);
      clearTimeout(createButtonTipTimeoutRef.current);
      setMaximumTimersTipStart(false);

      setMaximumTimersTipCreation(true);

      createButtonTipTimeoutRef.current = setTimeout(function () {
        setMaximumTimersTipCreation(false);
      }, 5000);
      return;
    }

    !getSharedObject().alertingTimers.length &&
      navigation.push("CreateTimerScreen");
  }

  // if (
  //   !getSharedObject()?.runningTimers.includes(timers[timers.length - 1]) &&
  //   !getSharedObject()?.name
  // ) {
  //   isTimerStopped = true;
  // }

  // if (
  //   getSharedObject()?.runningTimers.includes(timers[timers.length - 1]) &&
  //   !getSharedObject()?.name
  // ) {
  //   isTimerStopped = false;
  // }

  // if (
  //   getSharedObject()?.runningTimers.includes(
  //     timers[timers.length - 1]?.name
  //   ) /* &&
  //   !getSharedObject()?.name &&
  //   getSharedObject()?.isPaused === false */
  // ) {
  //   console.log("supa", getSharedObject()?.isPaused);

  //   isTimerStopped = false;
  // }

  // if(!getSharedObject()?.name) {
  //   isTimerStopped =
  // }
  // &&
  //   !getSharedObject()?.runningTimers.includes(
  //     getSharedObject()?.name || timers[timers.length - 1]?.name
  //   ));
  /* ||
    (!getSharedObject()?.name &&
      !getSharedObject().runningTimers.includes(timers[timers.length - 1])); */
  /* (workingTimersRef.current.includes(getSharedObject().name && timers[timers.length -1].name)) */

  console.log(
    "chekc",
    getSharedObject().runningTimers,
    getSharedObject().isActive,
    getSharedObject()?.name
  );

  return (
    <>
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
              onDelete(
                getSharedObject()?.name || timers[timers.length - 1].name
              )
            }
            style={styles.deleteButton}
          />
        </View>

        <View style={styles.playButtonContainer}>
          <IconButton
            size={36}
            icon={
              // The ultimate solution for the right icon to be displayed: I already found out that if there is no name then it the selected timers is the last one in the array or the first one in the view. And the second condition is to know whether that name is in the runningTimers array or not and if is - then the icon should be paused, otherwise it should be play.
              !getSharedObject()?.runningTimers.includes(
                getSharedObject()?.name || timers[timers.length - 1]?.name
              )
                ? "play"
                : "pause"
            }
            onPress={() => {
              if (
                workingTimersRef.current.length >= 5 &&
                !workingTimersRef.current.includes(getSharedObject()?.name)
              ) {
                clearTimeout(createButtonTipTimeoutRef.current);
                clearTimeout(startButtonTipTimeoutRef.current);
                setMaximumTimersTipCreation(false);

                setMaximumTimersTipStart(true);

                setTimeout(function () {
                  setMaximumTimersTipStart(false);
                }, 5000);
                return;
              }

              emitter.emit(
                `controlTimer-${getSharedObject()?.name || timers[timers.length - 1].name}`
              );
            }}
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
              workingTimersRef.current.length >= 5 && styles.disabledCreateBtn,
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
      {maximumTimersTipCreation && (
        <View style={styles.tipTextContainer}>
          <Text style={styles.tipText}>
            You already have 5 timers active (running or paused). Please stop
            one before creating another timer
          </Text>
        </View>
      )}
      {maximumTimersTipStart && (
        <View style={styles.tipTextContainer}>
          <Text style={styles.tipText}>
            You already have 5 timers active (running or paused). Please stop
            one before starting another timer
          </Text>
        </View>
      )}
    </>
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

  disabledCreateBtn: {
    opacity: 0.5,
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

  tipTextContainer: {
    padding: 12,
    position: "absolute",
    bottom: "25%",
    transform: "translate(0, 50%)",
    backgroundColor: Colors.primaryShade30,
    width: "100%",
  },
  tipText: {
    color: Colors.primaryTint90,
    fontSize: 16,
  },
});
