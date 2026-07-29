import Vosk from "react-native-vosk";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
} from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useResponsive } from "../hooks/useResponsive";
import { Text } from "../ui/AppText";
import { cleanStop, normalize } from "../utils/helpers";
import { getSharedObject } from "../utils/sharedVariables";

const eventEmitter = new NativeEventEmitter(NativeModules.AudioFocusModule);

export default memo(function VoiceCommandsControl({ setCommand }) {
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [result, setResult] = useState();
  const [improvedResult, setImprovedResult] = useState("");
  const partialResultEventRef = useRef(null);

  const voskRef = useRef(null);
  if (!voskRef.current) {
    voskRef.current = new Vosk();
  }
  const vosk = voskRef.current;

  const fadeAnimationRefCur = useRef(new Animated.Value(0)).current;

  const {
    recognizedCommand,
    setRecognizedCommand,
    setRecognizedTime,
    recognizedTime,
    isValidCommandRef,
    dynamicGrammar,
    isListening,
  } = useRecognizerData();

  const {
    recognizedCommandRef,
    setIsListening,
    isListeningRef,
    ignoreUntilRef,
    resultEventRef,
    currentSpeechRef,
  } = useRefsData();

  const { voiceEnabled, setVoiceEnabled } = useSettingsData();

  const { t } = useResponsive();

  const fadeInAndOut = useCallback(
    function () {
      Animated.sequence([
        Animated.timing(fadeAnimationRefCur, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(5000),
        Animated.timing(fadeAnimationRefCur, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [fadeAnimationRefCur],
  );

  useEffect(
    function () {
      fadeInAndOut();
    },
    [fadeAnimationRefCur, fadeInAndOut, recognizedCommand, recognizedTime],
  );

  // Loading vosk modal
  const load = useCallback(async () => {
    try {
      await vosk.loadModel("vosk-model-small-en-us-0.15");
      setIsReady(true);
      isReadyRef.current = true;
    } catch (error) {
      console.error(`An error occurred in the load vosk function`, error);
    }
  }, [vosk]);

  const unload = useCallback(() => {
    console.log("unload called");

    setIsReady(false);
    isReadyRef.current = false;
    setIsRecognizing(false);
    vosk?.stop();
    vosk?.unload();
  }, [vosk]);

  // Hope that the app state will be active at this point
  useEffect(
    function () {
      async function initVosk() {
        await load();
      }
      initVosk();
      // return () => unload();
    },
    [load, unload],
  );

  useEffect(function () {
    return () => {
      if (
        !getSharedObject().runningTimerNames.length &&
        !getSharedObject().alertingTimerNames.length
      ) {
        unload();
        cleanStop();
      }
    };
  }, []);

  // Listening logic
  const recordGrammar = useCallback(
    async (nextAppState) => {
      try {
        if (!isReady || !isReadyRef.current) {
          console.log("The model is not loaded yet 😲");
          return;
        }

        if (!voiceEnabled) {
          console.log("The app is not listening 💣");
          return;
        }

        // if (
        //   (AppState.currentState === "active" && !isRecognizing) ||
        //   nextAppState
        // ) {
        //   stop();
        // }
        console.log(AppState.currentState, "currentState?😄");

        const microGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        if (!microGranted) {
          console.log("Microphone permission denied by the user");
          return;
        }

        vosk
          .start({ grammar: dynamicGrammar })
          .then(() => {
            console.log("Starting recognition with grammar...");
            setIsRecognizing(true);
            setIsListening(true);
            isListeningRef.current = true;
          })
          .catch((e) => {
            console.error(`An error occurred while initializing vosk`, e);
            //   unload?.();
            // load();
          });
      } catch (error) {
        console.error("An error occurred in the recordGrammar function", error);
      }
    },
    [
      isReady,
      voiceEnabled,
      vosk,
      dynamicGrammar,
      setIsListening,
      isListeningRef,
    ],
  );

  const stop = useCallback(() => {
    vosk.stop();

    console.log("Stopping recognition...");
    setIsRecognizing(false);
    isListeningRef.current = false;
    setIsListening(false);
  }, [isListeningRef, setIsListening, vosk]);

  useEffect(
    function () {
      async function loadThis() {
        if (
          voiceEnabled &&
          isReady &&
          AppState.currentState === "active" &&
          !isRecognizing &&
          !(await NativeModules.AudioFocusModule.isMicInUseByOtherApp())
        ) {
          // stop();
          await recordGrammar();
        }

        if (!voiceEnabled) {
          stop();
        }
      }
      loadThis();
    },
    [
      isReady,
      recordGrammar,
      setIsListening,
      vosk,
      voiceEnabled,
      stop,
      isListeningRef,
      isListening,
      isRecognizing,
    ],
  );

  const addResultListener = useCallback(
    async function load() {
      try {
        console.log("Do we have something");

        // const focusResult =
        //   await NativeModules.AudioFocusModule.requestAudioFocus(() =>
        //     console.log(),
        //   );
        // console.log("Audio focus result:", focusResult);

        if (!voiceEnabled || !isListeningRef.current) {
          return;
        }

        // console.log(Date.now(), ignoreUntilRef.current, "The difference");

        resultEventRef.current?.remove();

        let vosk = voskRef.current;
        resultEventRef.current = vosk.onResult(async (res) => {
          console.log("OnResult");

          if (!isListeningRef.current) {
            console.log("While TTS speak, the resultEvent is ignored 🐽");
            return;
          }

          // console.log(currentSpeechRef.current);

          if (Date.now() < ignoreUntilRef.current) {
            console.log("Ignoring speech to prevent TTS making a difference");

            return;
          }

          console.log(
            "An onResult event has been caught: " + res,
            isListeningRef.current,
            Date.now(),
          );

          let checkedResponse = res
            .split(" ")
            .filter((el) => typeof el !== "object" && el !== "[unk]")
            .join(" ");

          if (currentSpeechRef.current) {
            const speechArray = new Set(
              currentSpeechRef.current.split(" ").map(normalize),
            );
            checkedResponse = res
              .split(" ")
              .filter(
                (el) =>
                  !speechArray.has(normalize(el)) &&
                  typeof el !== "object" &&
                  el !== "[unk]",
              )
              .join(" ");
            currentSpeechRef.current = "";
          }
          console.log("CHECKED_RESPONSE", checkedResponse);

          setResult(checkedResponse);
          setRecognizedCommand(checkedResponse);
          setRecognizedTime(Date.now());

          recognizedCommandRef.current = res;
        });
      } catch (error) {
        console.error("An error happened in onResultListener", error);
      }
    },
    [
      currentSpeechRef,
      ignoreUntilRef,
      isListeningRef,
      recognizedCommandRef,
      resultEventRef,
      setRecognizedCommand,
      setRecognizedTime,
      voiceEnabled,
    ],
  );

  useEffect(() => {
    addResultListener();

    const errorEvent = vosk.onError((e) => {
      console.error(e);
    });

    const timeoutEvent = vosk.onTimeout(() => {
      console.log("Recognizer timed out");
      setIsRecognizing(false);
    });

    return () => {
      resultEventRef.current?.remove();
      // finalResultEvent.remove();
      errorEvent.remove();
      timeoutEvent.remove();
    };
  }, [
    dynamicGrammar,
    improvedResult,
    setCommand,
    setRecognizedCommand,
    recognizedCommand,
    setRecognizedTime,
    isValidCommandRef,
    recognizedCommandRef,
    vosk,
    isListening,
    isListeningRef,
    voiceEnabled,
    ignoreUntilRef,
    resultEventRef,
    addResultListener,
  ]);

  useEffect(
    function () {
      NativeModules.AudioFocusModule.startMicMonitoring();
      const sub = eventEmitter.addListener(
        "onMicStatusChanged",
        function (inUse) {
          if (inUse === "true") {
            stop();
            console.log("The mic is used by another app 🎤");
          }

          return () => {
            sub.remove();
            NativeModules.AudioFocusModule.stopMicMonitoring();
          };
        },
      );
    },
    [resultEventRef, stop],
  );

  useEffect(
    function () {
      const sub = AppState.addEventListener("change", async (nextAppState) => {
        if (
          voiceEnabled &&
          isReady &&
          AppState.currentState === "active" &&
          !isRecognizing &&
          !(await NativeModules.AudioFocusModule.isMicInUseByOtherApp())
        ) {
          console.log("It should not run 100 times 😯");
          stop();
          recordGrammar(true);
        }
      });

      return () => sub.remove();
    },
    [isReady, isRecognizing, recordGrammar, stop, voiceEnabled],
  );

  return (
    <Animated.View style={{ opacity: fadeAnimationRefCur }}>
      <Text
        style={{
          marginTop: 24,
          color: Colors.primaryTint90,
          fontWeight: "bold",
          fontSize: t.subheading,
        }}
      >
        {result}
      </Text>
    </Animated.View>
  );
});
