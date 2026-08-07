import Vosk from "react-native-vosk";

import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  NativeEventEmitter,
  NativeModules,
} from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useCommandsControl } from "../hooks/useCommandsControl";
import { useResponsive } from "../hooks/useResponsive";
import { Text } from "../ui/AppText";
import { cleanStop } from "../utils/helpers";
import { getSharedObject } from "../utils/sharedVariables";

const eventEmitter = new NativeEventEmitter(NativeModules.AudioFocusModule);

export default memo(function VoiceCommandsControl({ setCommand }) {
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [result, setResult] = useState();
  const [improvedResult] = useState("");

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
  } = useRefsData();

  const { voiceEnabled } = useSettingsData();

  const { t } = useResponsive();

  const { fadeInAndOut, load, unload, recordGrammar, stop, addResultListener } =
    useCommandsControl({
      fadeAnimationRefCur,
      vosk,
      setIsReady,
      isReadyRef,
      setIsRecognizing,
      isReady,
      setResult,
    });

  useEffect(
    function () {
      fadeInAndOut();
    },
    [fadeAnimationRefCur, fadeInAndOut, recognizedCommand, recognizedTime],
  );

  useEffect(
    function () {
      async function initVosk() {
        await load();
      }
      initVosk();
    },
    [load, unload],
  );

  useEffect(
    function () {
      return () => {
        if (
          !getSharedObject().runningTimerNames.length &&
          !getSharedObject().alertingTimerNames.length
        ) {
          unload();
          cleanStop();
        }
      };
    },
    [unload],
  );

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

  useEffect(() => {
    const resultEvent = resultEventRef.current;
    addResultListener();

    const errorEvent = vosk.onError((e) => {
      console.error(e);
    });

    const timeoutEvent = vosk.onTimeout(() => {
      console.log("Recognizer timed out");
      setIsRecognizing(false);
    });

    return () => {
      resultEvent?.remove();
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
