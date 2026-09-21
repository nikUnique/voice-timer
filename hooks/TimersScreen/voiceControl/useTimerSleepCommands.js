import {
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { useSound } from "../../shared/useSound";
import { useSpeak } from "../../shared/useSpeak";

export function useTimerSleepCommands() {
  const {
    recognizedCommandRef,

    isTimerSleepingRef,

    commandsRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const { TIMER_WAKE_UP, TIMER_GO_SLEEP } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { successSound } = useSettingsData();

  const { playSoundGeneral } = useSound();

  function handleGoSleep() {
    if (
      !recognizedCommandRef.current?.includes(TIMER_GO_SLEEP) ||
      isTimerSleepingRef.current
    )
      return;
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak("Timer went to sleep");
    isTimerSleepingRef.current = true;
  }

  function handleWakeUp() {
    if (
      !recognizedCommandRef.current?.includes(TIMER_WAKE_UP) ||
      !isTimerSleepingRef.current
    )
      return;
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak("Timer ready");
    isTimerSleepingRef.current = false;
  }

  return { handleGoSleep, handleWakeUp };
}
