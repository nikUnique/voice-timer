import {
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { hasPhrase } from "../../../utils/helpers";
import { useSound } from "../../shared/useSound";
import { useSpeak } from "../../shared/useSpeak";

export function useTimerSleepCommands({ onSleepStateChange } = {}) {
  const { recognizedCommandRef, isTimerSleepingRef, commandsRef } =
    useRefsData();

  const { speak } = useSpeak();
  const { TIMER_WAKE_UP, TIMER_GO_SLEEP } = commandsRef?.current ?? {};

  const { successSound } = useSettingsData();
  const { playSoundGeneral } = useSound();

  function handleGoSleep() {
    if (
      !hasPhrase(recognizedCommandRef.current, TIMER_GO_SLEEP) ||
      isTimerSleepingRef.current
    )
      return;
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak("Timer went to sleep");
    isTimerSleepingRef.current = true;
    onSleepStateChange?.(true);
  }

  function handleWakeUp() {
    if (
      !hasPhrase(recognizedCommandRef.current, TIMER_WAKE_UP) ||
      !isTimerSleepingRef.current
    )
      return;
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak("Timer ready");
    isTimerSleepingRef.current = false;
    onSleepStateChange?.(false);
  }

  return { handleGoSleep, handleWakeUp };
}
