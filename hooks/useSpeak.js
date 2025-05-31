import { useCallback } from "react";
import Tts from "react-native-tts";
import { sleep } from "../utils/helpers";
import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";

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
        console.error("An error occured in the speak function 🤯", error);
      }
    },
    [isListeningRef, isVoiceFeedbackEnabled, setIsListening, voiceOptions]
  );

  return { speak };
}
