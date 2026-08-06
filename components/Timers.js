import * as Brightness from "expo-brightness";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import BackgroundService from "react-native-background-actions";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  NativeModules,
  PermissionsAndroid,
  StyleSheet,
  View,
} from "react-native";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
  useSoundData,
} from "../context/VoiceRecognizerContext";
import { useDefaultTimers } from "../hooks/useDefaultTimers";
import { useServiceAndSpeechControl } from "../hooks/useServiceAndSpeechControl";
import { useTimer } from "../hooks/useTimer";
import { DIM_PERCENTAGE, DIM_TIMEOUT } from "../utils/config";
import { emitter } from "../utils/EventEmitter";
import { getItemFromStorage, removeItemFromStorage } from "../utils/helpers";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import TimerList from "./TimerList";
import VoiceCommandsControl from "./VoiceCommandsControl";
import useShake from "../hooks/useShake";
import { useSpeak } from "../hooks/useSpeak";
import { useSound } from "../hooks/useSound";
import { useClapDetector } from "../hooks/useClapperDetector";

export default function Timers({ navigation }) {
  const [isAwake, setIsAwake] = useState(false);
  const [isTaskStopped, setIsTaskStopped] = useState(false);
  const [isMicroGranted, setIsMicroGranted] = useState(false);

  const activeTimeRef = useRef(null);
  const { dimScreenRef, keepScreenDim } = useSettingsData();
  const lastCommandRef = useRef(null);

  const {
    dynamicGrammar,
    allTimers,
    allActions,
    alertingTimerNamesRef,
    recognizedCommand,
    recognizedTime,
    isValidCommandRef,
    alertingTimerNames,
  } = useRecognizerData();

  const { keepScreenOnCommand, keepScreenOnMinutes, successSound } =
    useSettingsData();
  const { playSoundGeneral } = useSound();

  const { soundRef, soundIsPlayingRef } = useSoundData();

  const {
    setAlertingTimerNames,
    commandsRef,
    workingTimersRef,
    timers,
    isMediaPlayingRef,
    isMediaPausedRef,
    isMediaPausedManuallyRef,
  } = useRefsData();

  const { DEFAULT_PRESETS } = useDefaultTimers();

  useServiceAndSpeechControl();

  const { REPEAT, STOP_FINISHED, STOP_MEDIA } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { playSoundWrapper, stopSoundWrapper, options, backgroundTask } =
    useTimer();

  const { speak } = useSpeak();

  // const { start: startClapDetector, stop: stopClapDetector } = useClapDetector(
  //   async () => {
  //     const isMediaPlaying =
  //       await NativeModules.AudioFocusModule.isMediaPlaying();
  //     // speak("The phone shakes");
  //     await NativeModules.NativeUtilsModule.pressHeadsetButton();
  //     if (isMediaPlaying) {
  //       isMediaPausedRef.current = true;
  //       isMediaPausedManuallyRef.current = true;
  //       playSoundGeneral({
  //         fileName: successSound,
  //         shouldStop: false,
  //       });
  //       await speak("Media paused");
  //     } else {
  //       isMediaPausedRef.current = false;
  //       isMediaPausedManuallyRef.current = false;
  //       playSoundGeneral({
  //         fileName: successSound,
  //         shouldStop: false,
  //       });
  //       await speak("Media resumed");
  //     }
  //   },
  // );

  // useEffect(() => {
  //   startClapDetector();
  //   return () => stopClapDetector();
  // }, []);

  const forceKeepAwake = useCallback(async function (tag) {
    await deactivateKeepAwake(tag);
    await activateKeepAwakeAsync(tag);
  }, []);

  // useShake({
  //   enabled: true,
  //   sensitivity: 0.6,
  //   onShake: async () => {
  //     const isMediaPlaying =
  //       await NativeModules.AudioFocusModule.isMediaPlaying();
  //     // speak("The phone shakes");
  //     await NativeModules.NativeUtilsModule.pressHeadsetButton();
  //     if (isMediaPlaying) {
  //       isMediaPausedRef.current = true;
  //       isMediaPausedManuallyRef.current = true;
  //       playSoundGeneral({
  //         fileName: successSound,
  //         shouldStop: false,
  //       });
  //       await speak("Media paused");
  //     } else {
  //       isMediaPausedRef.current = false;
  //       isMediaPausedManuallyRef.current = false;
  //       playSoundGeneral({
  //         fileName: successSound,
  //         shouldStop: false,
  //       });
  //       await speak("Media resumed");
  //     }
  //   },
  // });

  useEffect(
    function () {
      async function confirmCommand() {
        try {
          let isTimerSpecificCommand = dynamicGrammar.find(
            (command) =>
              typeof command !== "object" &&
              timers.find((timer) =>
                command.toLowerCase().includes(timer.name.toLowerCase()),
              ) &&
              recognizedCommand?.includes(command?.toLowerCase()),
          );

          if (isTimerSpecificCommand) {
            lastCommandRef.current = isTimerSpecificCommand;
          }

          const command = dynamicGrammar
            .filter((item) => typeof item !== "object")
            .find((item) =>
              recognizedCommand?.toLowerCase().includes(item?.toLowerCase()),
            );

          if (!command) {
            return;
          }

          isValidCommandRef.current = recognizedCommand;

          if (activeTimeRef.current) {
            if (!keepScreenDim) await Brightness.restoreSystemBrightnessAsync();
            clearTimeout(activeTimeRef.current);
            clearTimeout(dimScreenRef.current);
          }

          if (!keepScreenOnCommand) {
            return;
          }

          console.log(keepScreenOnMinutes, "our precious minutes 🤵‍♂️");

          await forceKeepAwake("sleep");
          activeTimeRef.current = setTimeout(
            async function () {
              try {
                console.log("Deactivation, time to sleep? ❓");

                await deactivateKeepAwake("sleep");
              } catch (error) {
                console.error(
                  `An error occurred in the active screen function`,
                  error,
                );
              }
            },
            keepScreenOnMinutes * 60 * 1000,
          );

          dimScreenRef.current = setTimeout(async function () {
            try {
              await Brightness.setBrightnessAsync(DIM_PERCENTAGE);
            } catch (error) {
              console.error(
                `An error occurred in the dimScreenRef timeout`,
                error,
              );
            }
          }, DIM_TIMEOUT * 1000);
        } catch (err) {
          console.error("Error occurred", err);
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
      STOP_FINISHED,
      DEFAULT_PRESETS,
      timers,
      keepScreenOnCommand,
      keepScreenOnMinutes,
      dimScreenRef,
      isMediaPlayingRef,
      STOP_MEDIA,
      keepScreenDim,
      forceKeepAwake,
    ],
  );

  useEffect(
    function () {
      return () => {
        clearTimeout(activeTimeRef.current);
        clearTimeout(dimScreenRef.current);
      };
    },
    [dimScreenRef],
  );

  const prepareAlertingTimerNames = useCallback(
    async function () {
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
          alertingTimerNamesRef.current = getSharedObject().alertingTimerNames;
          setAlertingTimerNames(alertingTimerNamesRef.curent);
        }

        if (
          parsedValue?.length &&
          getSharedObject()?.alertingTimerNames?.length
        ) {
          alertingTimerNamesRef.current = [
            ...new Set([
              ...parsedValue,
              ...getSharedObject().alertingTimerNames,
            ]),
          ];
        }

        if (
          parsedValue?.length &&
          !getSharedObject()?.alertingTimerNames?.length
        ) {
          alertingTimerNamesRef.current = [...new Set([...parsedValue])];
        }

        if (parsedValue?.length) {
          updateSharedObject({
            alertingTimerNames: alertingTimerNamesRef.current,
          });

          setAlertingTimerNames(alertingTimerNamesRef.current);
        }

        if (!parsedValue) {
          const isPhoneLocked =
            await NativeModules.NativeUtilsModule?.isPhoneLocked();

          if (isPhoneLocked) return;
        }
      } catch (error) {
        console.error(
          "An error occurred in the prepareAlertingTimerNames function: ",
          error,
        );
      }
    },
    [alertingTimerNamesRef, setAlertingTimerNames],
  );

  useEffect(
    function () {
      prepareAlertingTimerNames(true);
      const appStateListener = AppState.addEventListener(
        "change",
        prepareAlertingTimerNames,
      );

      return () => {
        appStateListener.remove();
      };
    },
    [alertingTimerNamesRef, prepareAlertingTimerNames, setAlertingTimerNames],
  );

  useEffect(function () {
    async function load() {
      const localMicroGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      const updatedOptions = localMicroGranted
        ? options
        : { ...options, foregroundServiceType: ["specialUse"] };

      if (AppState.currentState === "active") {
        updateSharedObject({ isTaskRunning: true });
        BackgroundService.start(backgroundTask, updatedOptions);
      } else {
        const sub = AppState.addEventListener("change", (state) => {
          if (state === "active") {
            updateSharedObject({ isTaskRunning: true });
            BackgroundService.start(backgroundTask, updatedOptions);
            sub.remove();
          }
        });
        return () => sub.remove();
      }
    }
    load();
  }, []);

  useEffect(
    function () {
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
    },
    [soundIsPlayingRef, soundRef, workingTimersRef],
  );

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
          console.log("foreground service is restarted with microphone");

          updateSharedObject({ isTaskRunning: true });
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
    ],
  );

  useEffect(
    function () {
      emitter.all.delete("navigation");
      emitter.all.delete("goBack");
      emitter.on("navigation", (params) => {
        updateSharedObject({ changeTimerNameParams: params });
        navigation.navigate(params.screen);
      });
      emitter.on("goBack", () => {
        navigation.goBack();
      });
    },
    [navigation],
  );

  useEffect(
    function () {
      if (alertingTimerNames?.length > 0) {
        emitter.emit("navigation", { screen: "ModalScreen" });
      }
    },
    [alertingTimerNames],
  );

  return (
    <>
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
    </>
  );
}

const styles = StyleSheet.create({
  voiceRecognizerContainer: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});
