import { useRefsData } from "../../../context/VoiceRecognizerContext";
import { hasPhrase } from "../../../utils/helpers";
import { emitter } from "../../../utils/EventEmitter";
import { useCommandFeedback } from "../../shared/useCommandFeedback";

export function useTimerSleepCommands({ onSleepStateChange } = {}) {
  const { recognizedCommandRef, isTimerSleepingRef, commandsRef } =
    useRefsData();

  const { chimeThenSpeak } = useCommandFeedback();

  function handleGoSleep() {
    const { TIMER_GO_SLEEP } = commandsRef?.current ?? {};
    if (
      !hasPhrase(recognizedCommandRef.current, TIMER_GO_SLEEP) ||
      isTimerSleepingRef.current
    )
      return;
    chimeThenSpeak("Timer app went to sleep");
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
    chimeThenSpeak("Timer ready");
    isTimerSleepingRef.current = false;
    onSleepStateChange?.(false);
    emitter.emit("timerSleepChange", false);
  }

  return { handleGoSleep, handleWakeUp };
}
