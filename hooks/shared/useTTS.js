import { useCallback, useEffect } from "react";
import { NativeModules } from "react-native";
import Tts from "react-native-tts";
import { useRefsData } from "../../context/VoiceRecognizerContext";
import { getSharedObject } from "../../utils/sharedVariables";

export function useTTS() {
  const {
    isListeningRef,
    setIsListening,
    isMediaPausedRef,
    isMediaPausedManuallyRef,
    currentSpeechRef,
  } = useRefsData();
  const releaseAudioFocus = useCallback(
    function () {
      if (
        !isMediaPausedRef.current &&
        !isMediaPausedManuallyRef.current &&
        !getSharedObject().alertingTimerNames.length
      ) {
        console.log("Is it released 🎱");
        NativeModules.AudioFocusModule.releaseAudioFocus();
      }
    },
    [isMediaPausedManuallyRef, isMediaPausedRef],
  );

  const startTalking = useCallback(
    function startTalking() {
      isListeningRef.current = false;
      setIsListening(false);
    },
    [isListeningRef, setIsListening],
  );

  const doneTalking = useCallback(
    async function doneTalking(e) {
      releaseAudioFocus();

      console.log("Done talking");
      currentSpeechRef.current = "";
      isListeningRef.current = true;
      setIsListening(true);
    },
    [currentSpeechRef, isListeningRef, releaseAudioFocus, setIsListening],
  );

  const errorTalking = useCallback(
    function errorTalking() {
      releaseAudioFocus();
      console.error("An error occurred during speech utterance");
    },
    [releaseAudioFocus],
  );

  useEffect(
    function () {
      Tts.removeAllListeners("tts-start");
      Tts.removeAllListeners("tts-finish");
      Tts.removeAllListeners("tts-error");
      Tts.removeAllListeners("tts-cancel");
      Tts.addEventListener("tts-start", startTalking);
      Tts.addEventListener("tts-finish", (e) => {
        doneTalking(e);
      });
      Tts.addEventListener("tts-cancel", releaseAudioFocus);
      Tts.addEventListener("tts-error", errorTalking);
    },
    [doneTalking, errorTalking, releaseAudioFocus, startTalking],
  );

  useEffect(function () {
    return () => {
      Tts.removeAllListeners("tts-start");
      Tts.removeAllListeners("tts-finish");
      Tts.removeAllListeners("tts-error");
      Tts.removeAllListeners("tts-cancel");
    };
  }, []);
}
