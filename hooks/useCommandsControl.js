import { useCallback } from "react";
import { Animated, NativeModules, PermissionsAndroid } from "react-native";
import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { ensureBluetoothPermission, normalize } from "../utils/helpers";

export function useCommandsControl({
  fadeAnimationRefCur,
  vosk,
  setIsReady,
  isReadyRef,
  setIsRecognizing,
  isReady,
  setResult,
}) {
  const { voiceEnabled } = useSettingsData();
  const { dynamicGrammar, setRecognizedCommand, setRecognizedTime } =
    useRecognizerData();

  const {
    recognizedCommandRef,
    setIsListening,
    isListeningRef,
    ignoreUntilRef,
    resultEventRef,
    currentSpeechRef,
  } = useRefsData();

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

  // Loading vosk modal
  const load = useCallback(async () => {
    try {
      await vosk.loadModel("vosk-model-small-en-us-0.15");
      setIsReady(true);
      isReadyRef.current = true;
    } catch (error) {
      console.error(`An error occurred in the load vosk function`, error);
    }
  }, [isReadyRef, setIsReady, vosk]);

  const unload = useCallback(() => {
    console.log("unload called");

    setIsReady(false);
    isReadyRef.current = false;
    setIsRecognizing(false);
    vosk?.stop();
    vosk?.unload();
  }, [isReadyRef, setIsReady, setIsRecognizing, vosk]);

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

      const microGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      if (!microGranted) {
        console.log("Microphone permission denied by the user");
        return;
      }

      const hasBtPermission = await ensureBluetoothPermission();

      if (hasBtPermission) {
        try {
          await NativeModules.AudioFocusModule.startBluetoothMic();
        } catch (error) {
          console.error(error);
        }
      }

      vosk
        .start({ grammar: dynamicGrammar })
        .then(async () => {
          console.log("Starting recognition with grammar...");
          setIsRecognizing(true);
          setIsListening(true);
          isListeningRef.current = true;

          // if permission denied, just skip BT mic entirely - proceed on phone mic
        })
        .catch((e) => {
          console.error(`An error occurred while initializing vosk`, e);
        });
    } catch (error) {
      console.error("An error occurred in the recordGrammar function", error);
    }
  }, [
    isReady,
    isReadyRef,
    voiceEnabled,
    vosk,
    dynamicGrammar,
    setIsRecognizing,
    setIsListening,
    isListeningRef,
  ]);

  const stop = useCallback(() => {
    vosk.stop();
    console.log("Stopping recognition...");
    setIsRecognizing(false);
    isListeningRef.current = false;
    setIsListening(false);
    NativeModules.AudioFocusModule.stopBluetoothMic();
  }, [isListeningRef, setIsListening, setIsRecognizing, vosk]);

  const addResultListener = useCallback(
    async function load() {
      try {
        if (!voiceEnabled || !isListeningRef.current) {
          return;
        }

        resultEventRef.current?.remove();

        resultEventRef.current = vosk.onResult(async (res) => {
          if (!isListeningRef.current) {
            console.log("While TTS speak, the resultEvent is ignored 🐽");
            return;
          }

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
      setResult,
      voiceEnabled,
      vosk,
    ],
  );

  return { fadeInAndOut, load, unload, recordGrammar, stop, addResultListener };
}
