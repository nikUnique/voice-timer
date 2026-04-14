import { useCallback } from "react";
import Tts from "react-native-tts";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { sleep } from "../utils/helpers";

export function useSpeak() {
  const { isVoiceFeedbackEnabled } = useSettingsData();
  const { setIsListening, isListeningRef, voiceOptions } = useRefsData();

  const speak = useCallback(
    async function speak(text) {
      try {
        if (!isVoiceFeedbackEnabled) {
          return;
        }

        if (text.trim()) {
          setIsListening(false);
          isListeningRef.current = false;
          await sleep(0.5);
          Tts.speak(text, voiceOptions);
        }
      } catch (error) {
        console.error("An error occurred in the speak function 🤯", error);
      }
    },
    [isListeningRef, isVoiceFeedbackEnabled, setIsListening, voiceOptions],
  );

  return { speak };
}
