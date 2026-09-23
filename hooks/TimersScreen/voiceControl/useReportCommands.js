import { useRefsData } from "../../../context/VoiceRecognizerContext";
import {
  formatStatusSpeech,
  getTimePhrase,
  hasPhrase,
} from "../../../utils/helpers";
import { getSharedObject } from "../../../utils/sharedVariables";
import { useSpeak } from "../../shared/useSpeak";

export function useReportCommands() {
  const { recognizedCommandRef, commandsRef } = useRefsData();

  const { speak } = useSpeak();
  const { TIME, STATUS_REPORT } = commandsRef?.current ?? {};

  function handleTimeReport() {
    if (!hasPhrase(recognizedCommandRef.current, TIME)) return;
    speak(getTimePhrase());
  }

  function handleStatusReport() {
    if (!hasPhrase(recognizedCommandRef.current, STATUS_REPORT)) return;

    speak(
      formatStatusSpeech(
        getSharedObject()?.runningTimerNames,
        getSharedObject()?.pausedTimerNames,
        getSharedObject()?.alertingTimerNames,
      ),
    );
  }

  return { handleTimeReport, handleStatusReport };
}
