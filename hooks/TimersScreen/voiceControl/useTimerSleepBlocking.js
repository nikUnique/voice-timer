import { useRefsData } from "../../../context/VoiceRecognizerContext";

export function useTimerSleepBlocking() {
  const { recognizedCommandRef, isTimerSleepingRef, commandsRef } =
    useRefsData();

  const { STOP, STOP_MEDIA, TIMER_WAKE_UP } = commandsRef?.current
    ? commandsRef.current
    : {};

  function isTimerSleepBlocking() {
    return (
      isTimerSleepingRef.current &&
      recognizedCommandRef.current &&
      !recognizedCommandRef.current.includes(TIMER_WAKE_UP) &&
      !recognizedCommandRef.current.includes(STOP_MEDIA) &&
      !recognizedCommandRef.current.trim().toLowerCase().includes(STOP)
    );
  }

  return { isTimerSleepBlocking };
}
