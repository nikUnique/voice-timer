import Tts from "react-native-tts";

import { useCallback, useEffect, useMemo } from "react";
import { NativeModules } from "react-native";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { TTS_TIMEOUT, VOICE_FEEDBACK_SPEEDS } from "../../utils/config";
import { sleep } from "../../utils/helpers";

export function useSpeak() {
  const { isVoiceFeedbackEnabled, voiceFeedbackSpeedRef } = useSettingsData();
  const { setIsListening, isListeningRef, resultEventRef, currentSpeechRef } =
    useRefsData();

  useEffect(() => {
    function pickBestVoice(voices) {
      const enUs = voices.filter(
        (v) => v.language === "en-US" && !v.notInstalled,
      );
      // offline first, then by quality desc
      const sorted = enUs.sort((a, b) => {
        if (a.networkConnectionRequired !== b.networkConnectionRequired)
          return a.networkConnectionRequired ? 1 : -1; // offline first
        return b.quality - a.quality; // higher quality first
      });
      return sorted[0] ?? null;
    }
    Tts.getInitStatus().then(async () => {
      Tts.setDefaultLanguage("en-US");
      const available = await Tts.voices();
      const bestVoice = pickBestVoice(available);
      await Tts.setDefaultVoice(bestVoice);
    });
  }, []);

  // const voiceOptions = useMemo(
  //   () => ({
  //     onStart: () => {
  //       console.log("Started talking...");
  //       isListeningRef.current = false;
  //       setIsListening(false);
  //     },
  //     onStopped: () => {
  //       isListeningRef.current = true;
  //       setIsListening(true);
  //       console.log("Speech stopped");
  //     },
  //     onDone: () => {
  //       isListeningRef.current = true;
  //       setIsListening(true);
  //     },
  //     onError: () => {
  //       console.error("An error occurred during speech utterance");
  //     },
  //   }),
  //   [isListeningRef, setIsListening],
  // );

  const speak = useCallback(
    async function speak(text) {
      // return new Promise((resolve, reject) => {

      // })
      try {
        if (!isVoiceFeedbackEnabled) {
          return;
        }

        currentSpeechRef.current = text.toLowerCase();

        if (text.trim()) {
          resultEventRef.current?.remove();
          setIsListening(false);
          isListeningRef.current = false;
          await Tts.setDefaultRate(
            +voiceFeedbackSpeedRef.current ||
              VOICE_FEEDBACK_SPEEDS.find(
                (option) => option.label.toLowerCase() === "normal",
              ).value,
          );

          if (NativeModules.AudioFocusModule.isWiredHeadsetConnected()) {
            await sleep(0.5);
          }

          return new Promise((resolve, reject) => {
            let settled = false;

            const timer = setTimeout(() => {
              if (settled) return;
              settled = true;
              cleanup();
              reject(new Error(`TTS timed out after ${TTS_TIMEOUT}ms`));
            }, TTS_TIMEOUT);

            function cleanup() {
              finishListener.remove();
              cancelListener.remove();
              errorListener.remove();
              clearTimeout(timer);
            }
            const finishListener = Tts.addEventListener("tts-finish", () => {
              if (settled) return;
              settled = true;
              cleanup();
              resolve({ status: "finished" });
            });

            const cancelListener = Tts.addEventListener("tts-cancel", () => {
              if (settled) return;
              settled = true;
              cleanup();
              resolve({ status: "cancelled" });
            });

            const errorListener = Tts.addEventListener("tts-error", (err) => {
              if (settled) return;
              settled = true;
              cleanup();
              reject(err);
            });

            Tts.speak(text).catch((err) => {
              if (settled) return;
              settled = true;
              cleanup();
              reject(err);
            });
          });
        }
      } catch (error) {
        console.error("An error occurred in the speak function 🤯", error);
      }
    },
    [
      currentSpeechRef,
      isListeningRef,
      isVoiceFeedbackEnabled,
      resultEventRef,
      setIsListening,
      voiceFeedbackSpeedRef,
    ],
  );

  return { speak };
}
