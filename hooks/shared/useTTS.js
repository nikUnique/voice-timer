import { useCallback, useEffect } from "react";
import { NativeModules } from "react-native";
import Tts from "react-native-tts";
import * as vosk from "react-native-vosk";
import { useRefsData } from "../../context/VoiceRecognizerContext";
import { getSharedObject } from "../../utils/sharedVariables";

export function useTTS() {
  const {
    isListeningRef,
    setIsListening,
    isMediaPausedRef,
    isMediaPausedManuallyRef,
    currentSpeechRef,
    ignoreUntilRef,
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

  const resumeRecognizer = useCallback(function resumeRecognizer() {
    // Discard the TTS echo that Vosk may have buffered/decoded just before
    // TTS ended, so the trailing segment cannot surface as a late result
    // after ignoreUntil expires. reset() keeps the mic running.
    // Called on every way TTS can end (finish, cancel, error).
    try {
      vosk.reset();
    } catch (error) {
      console.error("An error occurred while resetting vosk", error);
    }
  }, []);

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
      ignoreUntilRef.current = Date.now() + 500;
      currentSpeechRef.current = "";

      resumeRecognizer();
      setTimeout(function () {
        resumeRecognizer();
      }, 100);
      setTimeout(function () {
        resumeRecognizer();
      }, 200);
      setTimeout(function () {
        resumeRecognizer();
      }, 300);
      setTimeout(function () {
        resumeRecognizer();
      }, 400);
      setTimeout(function () {
        resumeRecognizer();
      }, 500);

      isListeningRef.current = true;
      setIsListening(true);
    },
    [
      currentSpeechRef,
      ignoreUntilRef,
      isListeningRef,
      releaseAudioFocus,
      resumeRecognizer,
      setIsListening,
    ],
  );

  const errorTalking = useCallback(
    function errorTalking() {
      releaseAudioFocus();
      resumeRecognizer();
      console.error("An error occurred during speech utterance");
    },
    [releaseAudioFocus, resumeRecognizer],
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
      Tts.addEventListener("tts-cancel", () => {
        releaseAudioFocus();
        resumeRecognizer();
      });
      Tts.addEventListener("tts-error", errorTalking);
    },
    [
      doneTalking,
      errorTalking,
      releaseAudioFocus,
      resumeRecognizer,
      startTalking,
    ],
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
