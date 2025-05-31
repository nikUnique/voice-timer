import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, NativeModules, StyleSheet, View } from "react-native";
import BackgroundService from "react-native-background-actions";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
  useSoundData,
} from "../context/VoiceRecognizerContext";
import { useDefaultTimers } from "../hooks/useDefaultTimers";
import { useServiceAndSpeechControl } from "../hooks/useServiceAndSpeechControl";
import { useTimer } from "../hooks/useTimer";
import { emitter } from "../utils/EventEmitter";
import { getItemFromStorage, removeItemFromStorage } from "../utils/helpers";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

import TimerList from "./TimerList";
import VoiceCommandsControl from "./VoiceCommandsControl";

export default function Timers({ navigation }) {
  const [isAwake, setIsAwake] = useState(false);
  const [isTaskStopped, setIsTaskStopped] = useState(false);

  const activeTimeRef = useRef(null);
  const lastCommandRef = useRef(null);

  const {
    dynamicGrammar,
    allTimers,
    allActions,
    alertingTimerNamesRef,
    recognizedCommand,
    recognizedTime,
    isValidCommandRef,
    alertingTimers,
  } = useRecognizerData();

  const { keepScreenOnCommand, keepScreenOnMinutes } = useSettingsData();

  const { soundRef, soundIsPlayingRef } = useSoundData();

  const { setAlertingTimers, commandsRef, workingTimersRef, timers } =
    useRefsData();

  const { defaultTimers } = useDefaultTimers();

  useServiceAndSpeechControl();

  const { REPEAT, RESET_FINISHED } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { playSoundWrapper, stopSoundWrapper, options, backgroundTask } =
    useTimer();

  useEffect(
    function () {
      async function confirmCommand() {
        try {
          let isTimerSpecificCommand = dynamicGrammar.find(
            (command) =>
              typeof command !== "object" &&
              timers.find((timer) =>
                command.toLowerCase().includes(timer.name.toLowerCase())
              ) &&
              recognizedCommand?.includes(command?.toLowerCase())
          );

          if (isTimerSpecificCommand) {
            // lastCommandRef.current = recognizedCommand;
            lastCommandRef.current = isTimerSpecificCommand;
          }

          const command = dynamicGrammar
            .filter((item) => typeof item !== "object")
            .find((item) =>
              recognizedCommand?.toLowerCase().includes(item?.toLowerCase())
            );

          if (!command) {
            return;
          }

          isValidCommandRef.current = recognizedCommand;

          if (activeTimeRef.current) {
            clearTimeout(activeTimeRef.current);
          }

          if (!keepScreenOnCommand) {
            return;
          }

          activateKeepAwakeAsync();
          activeTimeRef.current = setTimeout(
            async function () {
              try {
                await deactivateKeepAwake();
                // console.log("KeepScreenOnMinutes", keepScreenOnMinutes * 60);
              } catch (error) {
                console.error(
                  `An error occured in the active screen function`,
                  error
                );
              }
            },
            keepScreenOnMinutes * 60 * 1000
          );
        } catch (err) {
          console.error("Error occured", err);
          throw new Error(err);
        }
      }
      confirmCommand();
    },
    [
      recognizedCommand,
      recognizedTime,
      lastCommandRef,
      isValidCommandRef,
      dynamicGrammar,
      isAwake,
      REPEAT,
      RESET_FINISHED,
      defaultTimers,
      timers,
      keepScreenOnCommand,
      keepScreenOnMinutes,
    ]
  );

  const prepareAlertingTimers = useCallback(
    async function (nextAppState) {
      try {
        if (
          AppState.currentState !== "active" ||
          getSharedObject()?.resetAllFinishedFromApp
        ) {
          updateSharedObject({ resetAllFinishedFromApp: false });
          return;
        }

        let parsedValue = await getItemFromStorage("alertingTimerNames");

        if (!parsedValue) {
          alertingTimerNamesRef.current = getSharedObject().alertingTimers;
          setAlertingTimers(alertingTimerNamesRef.curent);
        }

        if (parsedValue?.length && getSharedObject()?.alertingTimers?.length) {
          alertingTimerNamesRef.current = [
            ...new Set([...parsedValue, ...getSharedObject().alertingTimers]),
          ];
        }

        if (parsedValue?.length && !getSharedObject()?.alertingTimers?.length) {
          alertingTimerNamesRef.current = [...new Set([...parsedValue])];
        }

        if (parsedValue?.length) {
          updateSharedObject({
            alertingTimers: alertingTimerNamesRef.current,
          });

          setAlertingTimers(alertingTimerNamesRef.current);
        }

        // await removeItemFromStorage("alertingTimerNames");

        if (!parsedValue) {
          const isPhoneLocked =
            await NativeModules.NativeUtilsModule?.isPhoneLocked();

          if (isPhoneLocked) return;

          // alertingTimerNamesRef.current = [];
          // setAlertingTimers(alertingTimerNamesRef.current);
        }
      } catch (error) {
        console.error(
          "An error occured in the prepareAlertingTimers function: ",
          error
        );
      }
    },
    [alertingTimerNamesRef, setAlertingTimers]
  );

  useEffect(
    function () {
      prepareAlertingTimers(true);
      const appStateListener = AppState.addEventListener(
        "change",
        prepareAlertingTimers
      );

      return () => {
        appStateListener.remove();
      };
    },
    [alertingTimerNamesRef, prepareAlertingTimers, setAlertingTimers]
  );

  useEffect(function () {
    // emitter.all.clear();
    // AsyncStorage.clear();
    // removeItemFromStorage("workingTimers");
    // if (AppState.currentState !== "background") {
    //   notifee.stopForegroundService();
    // }

    () => {
      if (workingTimersRef.current.length === 0) {
        soundIsPlayingRef.current = false;
        // emitter.all.clear();
        removeItemFromStorage("workingTimers");
        removeItemFromStorage("alertingTimerNames");
        soundRef.current?.stopAsync();
        soundRef.current?.unloadAsync();
      }
    };
  }, []);

  useEffect(
    function () {
      async function load() {
        const parsedValue = await getItemFromStorage("workingTimers");

        workingTimersRef.current = parsedValue || [];

        if (workingTimersRef.current.length === 0) {
          console.log("All listeners are cleared");

          // emitter.all.clear();
        }

        // Culprit of stealing at least more than 5 hours
        // await removeItemFromStorage("alertingTimerNames");

        // This listener becomes stale after a transition from background to foreground, but by passing all the values directly from the event, it works as expected. Instead of doing it this way I could just keep the sound reference in the simple shared object which persists even if the app is in the background, but back then I didn't thought about this and therefore to not waste time I leave it like this
        if (!emitter.all.has("stopSound")) {
          console.log("We add new listener :)");
          emitter.all.delete("playSound");
          emitter.all.delete("stopSound");
          emitter.on("playSound", playSoundWrapper);
          emitter.on("stopSound", stopSoundWrapper);
        }

        emitter.all.delete("startForegroundService");
        emitter.on("startForegroundService", async () => {
          await BackgroundService.start(backgroundTask, options);
        });
      }
      load();
    },
    [
      backgroundTask,
      options,
      playSoundWrapper,
      stopSoundWrapper,
      workingTimersRef,
    ]
  );

  useEffect(
    function () {
      emitter.all.delete("navigation");
      emitter.all.delete("goBack");
      emitter.on("navigation", (params) => {
        console.log("params", params);
        updateSharedObject({ changeTimerNameParams: params });
        navigation.navigate(params.screen);
      });
      emitter.on("goBack", () => {
        navigation.goBack();
      });
    },
    [navigation]
  );

  useEffect(
    function () {
      if (alertingTimers?.length > 0) {
        emitter.emit("navigation", { screen: "ModalScreen" });
      }
    },
    [alertingTimers]
  );

  return (
    <View style={styles.container}>
      {
        <TimerList
          lastCommandRef={lastCommandRef}
          setIsTaskStopped={setIsTaskStopped}
        />
      }

      <View style={styles.voiceRecognizerContainer}>
        <VoiceCommandsControl
          actionsDefault={allActions}
          timersDefault={allTimers}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },

  voiceRecognizerContainer: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});
