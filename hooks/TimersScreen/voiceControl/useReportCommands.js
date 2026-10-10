import { useRefsData } from "../../../context/VoiceRecognizerContext";
import {
  formatStatusSpeech,
  getTimePhrase,
  hasPhrase,
} from "../../../utils/helpers";
import { getSharedObject } from "../../../utils/sharedVariables";
import { useCommandFeedback } from "../../shared/useCommandFeedback";

export function useReportCommands() {
  const { recognizedCommandRef, commandsRef } = useRefsData();

  const { TIME, STATUS_REPORT } = commandsRef?.current ?? {};

  const { chimeThenSpeak } = useCommandFeedback();

  function handleTimeReport() {
    if (!hasPhrase(recognizedCommandRef.current, TIME)) return;
    chimeThenSpeak(getTimePhrase());
  }

  function handleStatusReport() {
    if (!hasPhrase(recognizedCommandRef.current, STATUS_REPORT)) return;
    chimeThenSpeak(
      formatStatusSpeech(
        getSharedObject()?.runningTimerNames,
        getSharedObject()?.pausedTimerNames,
        getSharedObject()?.alertingTimerNames,
      ),
    );
  }

  return { handleTimeReport, handleStatusReport };
}
