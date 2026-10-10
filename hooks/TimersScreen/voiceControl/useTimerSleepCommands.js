import {
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { hasPhrase } from "../../../utils/helpers";
import { emitter } from "../../../utils/EventEmitter";
import { useSound } from "../../shared/useSound";
import { useSpeak } from "../../shared/useSpeak";

export function useTimerSleepCommands({ onSleepStateChange } = {}) {
  const { recognizedCommandRef, isTimerSleepingRef, commandsRef } =
    useRefsData();

  const { speak } = useSpeak();

  const { successSound } = useSettingsData();
  const { playSoundGeneral } = useSound();

  function handleGoSleep() {
    const { TIMER_GO_SLEEP } = commandsRef?.current ?? {};
    if (
      !hasPhrase(recognizedCommandRef.current, TIMER_GO_SLEEP) ||
      isTimerSleepingRef.current
    )
      return;
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak("Timer app went to sleep");
    isTimerSleepingRef.current = true;
    onSleepStateChange?.(true);
    emitter.emit("timerSleepChange", true);
  }

  function handleWakeUp() {
    const { TIMER_WAKE_UP } = commandsRef?.current ?? {};
    if (
      !hasPhrase(recognizedCommandRef.current, TIMER_WAKE_UP) ||
      !isTimerSleepingRef.current
    )
      return;
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak("Timer ready");
    isTimerSleepingRef.current = false;
    onSleepStateChange?.(false);
    emitter.emit("timerSleepChange", false);
  }

  return { handleGoSleep, handleWakeUp };
}
