import { useRefsData } from "../../../context/VoiceRecognizerContext";
import { hasPhrase } from "../../../utils/helpers";

export function useTimerSleepBlocking() {
  const { recognizedCommandRef, isTimerSleepingRef, commandsRef } =
    useRefsData();

  const { STOP, STOP_MEDIA, TIMER_WAKE_UP } = commandsRef?.current ?? {};

  function isTimerSleepBlocking() {
    const command = recognizedCommandRef.current;
    return Boolean(
      isTimerSleepingRef.current &&
        command &&
        !hasPhrase(command, TIMER_WAKE_UP) &&
        !hasPhrase(command, STOP_MEDIA) &&
        !hasPhrase(command, STOP),
    );
  }

  return { isTimerSleepBlocking };
}
