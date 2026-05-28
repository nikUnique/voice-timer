import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { useRefsData } from "../context/VoiceRecognizerContext";
import IconButton from "../ui/IconButton";
import { emitter } from "../utils/EventEmitter";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

export default function TimerInterfaceButtons({ onDelete }) {
  const navigation = useNavigation();

  const [stateChanged, setStateChanged] = useState(false);
  const [maximumTimersTipCreation, setMaximumTimersTipCreation] =
    useState(false);
  const [maximumTimersTipStart, setMaximumTimersTipStart] = useState(false);

  const createButtonTipTimeoutRef = useRef(null);
  const startButtonTipTimeoutRef = useRef(null);

  const { timers, workingTimersRef } = useRefsData();
  const thereAre30Timers = timers.length >= 30;

  useEffect(
    function () {
      emitter.all.delete(`timerInterfaceButtonsUpdate`);
      emitter.on(`timerInterfaceButtonsUpdate`, () => {
        setStateChanged((prev) => !prev);
      });
    },
    [setStateChanged],
  );

  useEffect(function () {
    return () => {
      // We do not want any selected timers when we are in the background, so that when we are back and we still didn't scroll - we would use the first thing in the view and we won't get the name which was before we moved to the background
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

    !getSharedObject().alertingTimerNames.length &&
      navigation.push("CreateTimerScreen");
  }

  const playButton = {
    borderRadius: "50%",
    backgroundColor: Colors.whiteAlpha20,
    padding: 24,
  };

  const sideBtn = {
    borderRadius: "50%",
    backgroundColor: Colors.whiteAlpha20,
    padding: 20,
  };

  return (
    <>
      <View style={styles.btnsContainer}>
        <View
          style={[
            styles.sideButtonContainer,
            workingTimersRef.current.includes(
              getSharedObject()?.name || timers[timers.length - 1]?.name,
            ) && styles.disabledDeleteBtn,
          ]}
        >
          <IconButton
            size={36}
            icon='trash'
            color={Colors.primaryTint90}
            onPress={() =>
              onDelete(
                getSharedObject()?.name || timers[timers.length - 1].name,
              )
            }
            style={sideBtn}
          />
        </View>

        <View style={styles.playButtonContainer}>
          <IconButton
            size={36}
            icon={
              // The ultimate solution for the right icon to be displayed: I already found out that if there is no name then it the selected timers is the last one in the array or the first one in the view. And the second condition is to know whether that name is in the runningTimerNames array or not and if it is - then the icon should be paused, otherwise it should be play.
              !getSharedObject()?.runningTimerNames.includes(
                getSharedObject()?.name || timers[timers.length - 1]?.name,
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
                `controlTimer-${getSharedObject()?.name || timers[timers.length - 1].name}`,
              );
            }}
            color={Colors.primaryTint90}
            style={[
              playButton,
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
              style={sideBtn}
            />
          </View>
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
  // deleteButton: {
  //   borderRadius: "50%",
  //   backgroundColor: Colors.whiteAlpha20,
  //   padding: 24,
  // },

  disabledDeleteBtn: {
    opacity: 0.5,
    pointerEvents: "none",
  },

  disabledCreateBtn: {
    opacity: 0.5,
  },

  // playButton: {
  //   borderRadius: "50%",
  //   backgroundColor: Colors.whiteAlpha20,
  //   padding: 32,
  // },

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
