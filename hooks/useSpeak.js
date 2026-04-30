import Tts from "react-native-tts";

import { useCallback } from "react";

import {
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import Sound from "react-native-sound";
import { NativeModules } from "react-native";

export function useSpeak() {
  const { isVoiceFeedbackEnabled } = useSettingsData();
  const { setIsListening, isListeningRef, voiceOptions } = useRefsData();

  const speak = useCallback(
    async function speak(text, speed) {
      try {
        if (!isVoiceFeedbackEnabled) {
          return;
        }

        if (text.trim()) {
          // NativeModules.AudioFocusModule?.stopBluetoothSco();
          NativeModules.AudioFocusModule.requestAudioFocus();
          setIsListening(false);
          isListeningRef.current = false;
          await Tts.setDefaultRate(speed || 0.5);

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
