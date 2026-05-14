import Vosk from "react-native-vosk";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, AppState, PermissionsAndroid } from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useResponsive } from "../hooks/useResponsive";
import { Text } from "../ui/AppText";

export default memo(function VoiceCommandsControl({ setCommand }) {
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [result, setResult] = useState();
  const [improvedResult, setImprovedResult] = useState("");

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
    commandsRef,
  } = useRefsData();

  const { PLAY_MEDIA, STOP_MEDIA, TIMER_WAKE_UP } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { voiceEnabled } = useSettingsData();

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
    setIsReady(false);
    isReadyRef.current = false;
    setIsRecognizing(false);
    vosk?.unload();
  }, [vosk]);

  // Hope that the app state will be active at this point
  useEffect(function () {
    async function initVosk() {
      await load();
    }
    initVosk();
    return () => unload();
  }, []);

  // Listening logic
  const recordGrammar = useCallback(async () => {
    try {
      if (!isReady || !isReadyRef.current) {
        console.log("The model is not loaded yet 😲");
        return;
      }

      if (!voiceEnabled) {
        console.log("The app is not listening 💣");
        return;
      }

      if (AppState.currentState === "active") {
        await stop();
      }

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
        .catch((e) =>
          console.error(`An error occurred while initializing vosk`, e),
        );
    } catch (error) {
      console.error("An error occurred in the recordGrammar function", error);
    }
  }, [
    isReady,
    voiceEnabled,
    vosk,
    dynamicGrammar,
    stop,
    setIsListening,
    isListeningRef,
  ]);

  const stop = useCallback(async () => {
    await vosk.stop();

    console.log("Stopping recognition...");
    setIsRecognizing(false);
  }, [vosk]);

  // useEffect(
  //   function () {
  //     setIsListening(true);
  //     isListeningRef.current = true;
  //   },
  //   [isListeningRef, setIsListening],
  // );

  useEffect(
    function () {
      async function loadThis() {
        if (
          voiceEnabled &&
          isReady &&
          AppState.currentState === "active" &&
          !isRecognizing
        ) {
          await recordGrammar();
        } /* else {
          setIsRecognizing(false);
        } */

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
    if (!voiceEnabled || !isListeningRef.current) {
      return;
    }

    const resultEvent = vosk.onResult(async (res) => {
      // if (Date.now() < ignoreUntilRef.current) {
      //   console.log("Ignoring speech to prevent TTS making a difference");

      //   return;
      // }
      console.log(
        "An onResult event has been caught: " + res,
        isListeningRef.current,
        Date.now(),
      );
      const checkedResponse = res.includes("[unk]")
        ? "Unrecognized phrase"
        : res;

      setResult(checkedResponse);
      setRecognizedCommand(checkedResponse);
      setRecognizedTime(Date.now());

      recognizedCommandRef.current = res;
    });

    const errorEvent = vosk.onError((e) => {
      console.error(e);
    });

    const timeoutEvent = vosk.onTimeout(() => {
      console.log("Recognizer timed out");
      setIsRecognizing(false);
    });

    return () => {
      resultEvent.remove();
      // partialResultEvent.remove();
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
  ]);

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
