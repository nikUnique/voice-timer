import Tts from "react-native-tts";

import { useCallback, useEffect, useMemo } from "react";

import { NativeModules } from "react-native";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";

function duration(text) {
  const words = text.trim().split(/\s+/).length;
  return words * 150;
}
export function useSpeak() {
  const { isVoiceFeedbackEnabled } = useSettingsData();
  const { setIsListening, isListeningRef, ignoreUntilRef } = useRefsData();

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

  const voiceOptions = useMemo(
    () => ({
      onStart: () => {
        console.log("Started talking...");
        isListeningRef.current = false;
        setIsListening(false);
      },
      onStopped: () => {
        isListeningRef.current = true;
        setIsListening(true);
        console.log("Speech stopped");
      },
      onDone: () => {
        isListeningRef.current = true;
        setIsListening(true);
      },
      onError: () => {
        console.error("An error occurred during speech utterance");
      },
    }),
    [isListeningRef, setIsListening],
  );

  const speak = useCallback(
    async function speak(text, speed) {
      try {
        if (!isVoiceFeedbackEnabled) {
          return;
        }

        if (text.trim()) {
          setIsListening(false);
          isListeningRef.current = false;
          await Tts.setDefaultRate(speed || 0.5);

          NativeModules.AudioFocusModule.requestAudioFocus(async (granted) => {
            if (granted) {
              console.log("Granted focus");

              ignoreUntilRef.current = Date.now() + duration(text) + 300;
            }
          });
        }
      } catch (error) {
        console.error("An error occurred in the speak function 🤯", error);
      }
    },
    [isListeningRef, isVoiceFeedbackEnabled, setIsListening, voiceOptions],
  );

  return { speak };
}
