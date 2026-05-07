import Vosk from "react-native-vosk";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
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
    isMediaPlayingRef,
  } = useRefsData();

  const { voiceEnabled } = useSettingsData();

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

  useEffect(function () {
    async function initVosk() {
      await load();
    }
    initVosk();
    return () => unload();
  }, []);

  const recordGrammar = useCallback(async () => {
    try {
      if (!isReady || !isReadyRef.current) {
        console.log("The model is not loaded yet 😲");
        return;
      }

      // if (!isListening) {
      //   console.log("The app is not listening 💣");
      //   return;
      // }
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

      AppState.currentState === "active" &&
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
  }, [isReady, voiceEnabled, vosk, dynamicGrammar, stop]);

  const stop = useCallback(async () => {
    await vosk.stop();
    // NativeModules.AudioFocusModule?.stopVoiceMode();
    // NativeModules.AudioFocusModule?.stopBluetoothSco();
    console.log("Stopping recognition..." /* , result */);
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
        // if (!voiceEnabled || !isListening) {
        //   await stop();
        //   return;
        // }

        if (/* isListening */ voiceEnabled && isReady /* && !isPhoneLocked */) {
          await recordGrammar();
        } else {
          setIsRecognizing(false);
          // stop();
        }

        if (!voiceEnabled) {
          setIsRecognizing(false);
          stop();
        }
      }
      loadThis();
    },
    [isReady, recordGrammar, setIsListening, vosk, voiceEnabled, stop],
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
      // if (!isListening || isPhoneLocked) {
      //   console.log(`The timer is not listening at the moment 🫧`);
      //   return;
      // }

      const checkedResponse = res.includes("[unk]")
        ? "Unrecognized phrase"
        : res;

      if (isListeningRef.current && voiceEnabled) {
        setResult(checkedResponse);
        setRecognizedCommand(checkedResponse);
        setRecognizedTime(Date.now());

        recognizedCommandRef.current = res;
      }
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
