import Vosk from "react-native-vosk";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeModules,
  PermissionsAndroid,
  StyleSheet,
  Text,
} from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { useIsLocked } from "../hooks/useIsLocked";

export default memo(function VoiceCommandsControl({ setCommand }) {
  const [isReady, setIsReady] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [result, setResult] = useState();
  const [improvedResult, setImprovedResult] = useState("");

  const vosk = useRef(new Vosk()).current;

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

  const { recognizedCommandRef, setIsListening, isListeningRef } =
    useRefsData();

  const { voiceEnabled } = useSettingsData();

  const { isPhoneLocked } = useIsLocked();

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
    [fadeAnimationRefCur, recognizedCommand, recognizedTime],
  );

  useEffect(
    function () {
      fadeInAndOut();
    },
    [fadeAnimationRefCur, fadeInAndOut],
  );

  const load = useCallback(async () => {
    try {
      await vosk.loadModel("vosk-model-small-en-us-0.15");
      setIsReady(true);
    } catch (error) {
      console.error(`An error occurred in the load vosk function`, error);
    }
  }, [vosk]);

  const unload = useCallback(() => {
    setIsReady(false);
    setIsRecognizing(false);
    vosk?.unload();
  }, [vosk]);

  useEffect(function () {
    async function initVosk() {
      await load();
    }
    initVosk();
    return () => unload();
  }, []);

  const recordGrammar = useCallback(async () => {
    try {
      if (!isReady) {
        console.log("The model is not loaded yet 😲");
        return;
      }

      await stop();
      if (!isListening) {
        console.log("The app is not listening 💣");
        return;
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
        })
        .catch((e) =>
          console.error(`An error occurred while initializing vosk`, e),
        );
    } catch (error) {
      console.error("An error occurred in the recordGrammar function", error);
    }
  }, [isReady, stop, isListening, vosk, dynamicGrammar]);

  const stop = useCallback(async () => {
    vosk.stop();
    console.log("Stoping recognition..." /* , result */);
    setIsRecognizing(false);
  }, [vosk]);

  useEffect(
    function () {
      setIsListening(true);
      isListeningRef.current = true;
    },
    [isListeningRef, setIsListening],
  );

  useEffect(
    function () {
      async function loadThis() {
        if (!voiceEnabled || !isListening) {
          await stop();
          return;
        }

        if (isListening && isReady && !isPhoneLocked) {
          await recordGrammar();
        } else {
          vosk.stop();
          setIsRecognizing(false);
          stop();
        }
      }
      loadThis();
    },
    [
      isListening,
      isReady,
      recordGrammar,
      setIsListening,
      stop,
      vosk,
      voiceEnabled,
      isPhoneLocked,
    ],
  );

  useEffect(() => {
    const resultEvent = vosk.onResult(async (res) => {
      console.log(
        "An onResult event has been caught: " + res,
        isListening,
        isListeningRef.current,
      );
      const isPhoneLocked =
        await NativeModules.NativeUtilsModule.isPhoneLocked();
      if (!isListening || isPhoneLocked) {
        console.log(`The timer is not listening at the moment 🫧`);
        return;
      }

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
  ]);

  return (
    <Animated.View style={{ opacity: fadeAnimationRefCur }}>
      <Text
        style={{
          marginTop: 24,
          color: Colors.primaryTint90,
          fontWeight: "bold",
          fontSize: 20,
        }}
      >
        {result}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 25,
    flex: 1,
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  recordingButtons: {
    gap: 15,
    display: "flex",
  },
  textContainer: {
    gap: 15,
  },

  resultText: {
    backgroundColor: "orange",
  },
});
