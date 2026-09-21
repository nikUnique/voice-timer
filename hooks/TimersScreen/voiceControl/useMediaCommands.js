import { NativeModules } from "react-native";
import {
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { hasPhrase } from "../../../utils/helpers";
import { useSpeak } from "../../shared/useSpeak";

export function useMediaCommands({ pauseMedia, resumeMedia }) {
  const { recognizedCommandRef, isMediaPlayingRef, commandsRef } =
    useRefsData();

  const { speak } = useSpeak();
  const { PLAY_MEDIA, STOP_MEDIA, ANSWER_CALL, SKIP_NEXT, SKIP_PREVIOUS } =
    commandsRef?.current ? commandsRef.current : {};

  const { isHeadsetBroken, isSkipCommandsEnabledRef } = useSettingsData();

  async function refreshMediaState() {
    isMediaPlayingRef.current =
      await NativeModules.AudioFocusModule.isMediaPlaying();
  }

  async function handleStopMedia() {
    if (!isMediaPlayingRef.current) return;
    if (!hasPhrase(recognizedCommandRef.current, STOP_MEDIA)) return;

    if (!isHeadsetBroken) {
      await NativeModules.NativeUtilsModule.pressHeadsetButton();
      pauseMedia();
      return;
    }

    NativeModules.AudioFocusModule.requestAudioFocus(async (granted) => {
      if (granted) pauseMedia();
    });
  }

  function handleSkip() {
    if (!isMediaPlayingRef.current || !isSkipCommandsEnabledRef.current) return;

    if (hasPhrase(recognizedCommandRef.current, SKIP_NEXT)) {
      NativeModules.NativeUtilsModule.skipNext();
      speak("Next");
    }

    if (hasPhrase(recognizedCommandRef.current, SKIP_PREVIOUS)) {
      NativeModules.NativeUtilsModule.skipPrevious();
      speak("Previous");
    }
  }

  async function handlePlayMedia() {
    if (isMediaPlayingRef.current || !PLAY_MEDIA) return;
    if (!hasPhrase(recognizedCommandRef.current, PLAY_MEDIA)) return;

    await resumeMedia();
    if (!isHeadsetBroken) {
      await NativeModules.NativeUtilsModule.pressHeadsetButton();
    }
    if (isHeadsetBroken) {
      await NativeModules.AudioFocusModule.releaseAudioFocus();
    }
  }

  function handleAnswerCall() {
    if (hasPhrase(recognizedCommandRef.current, ANSWER_CALL)) {
      NativeModules.NativeUtilsModule.answerCall();
    }
  }

  return {
    refreshMediaState,
    handleStopMedia,
    handleSkip,
    handlePlayMedia,
    handleAnswerCall,
  };
}
