import { useRefsData } from "../../../context/VoiceRecognizerContext";
import {
  formatStatusSpeech,
  getTimePhrase,
  normalize,
} from "../../../utils/helpers";
import { getSharedObject } from "../../../utils/sharedVariables";
import { useSpeak } from "../../shared/useSpeak";

export function useReportCommands() {
  const {
    recognizedCommandRef,

    commandsRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const { TIME, STATUS_REPORT } = commandsRef?.current
    ? commandsRef.current
    : {};

  function handleTimeReport() {
    if (!TIME) return;
    const words = recognizedCommandRef.current?.split(" ").map(normalize);
    if (!words?.includes(TIME)) return;
    speak(getTimePhrase());
  }

  function handleStatusReport() {
    if (!STATUS_REPORT) return;
    if (
      !recognizedCommandRef.current
        ?.toLowerCase()
        .trim()
        .includes(STATUS_REPORT)
    )
      return;

    speak(
      formatStatusSpeech(
        getSharedObject().runningTimerNames,
        getSharedObject().pausedTimerNames,
        getSharedObject().alertingTimerNames,
      ),
    );
  }

  return { handleTimeReport, handleStatusReport };
}
