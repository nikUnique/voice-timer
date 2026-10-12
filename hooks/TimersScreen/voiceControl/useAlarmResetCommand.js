import {
  useRecognizerData,
  useRefsData,
} from "../../../context/VoiceRecognizerContext";
import { resetTimerEmitter } from "../../../utils/EventEmitter";
import { formatRingingResetSpeech, hasPhrase } from "../../../utils/helpers";
import { useCommandFeedback } from "../../shared/useCommandFeedback";

export function useAlarmResetCommand() {
  const { alertingTimerNamesRef } = useRecognizerData();
  const { secretIdentifierRef, recognizedCommandRef, commandsRef } =
    useRefsData();

  const { chimeThenSpeak } = useCommandFeedback();

  function handleResetAlarm() {
    const { STOP, STOP_FINISHED } = commandsRef?.current ?? {};
    const identifier = secretIdentifierRef.current
      ?.split(" ")
      .slice(2, -1)
      .join(" ");
    const target = `${STOP_FINISHED} ${identifier}`;

    if (!hasPhrase(recognizedCommandRef.current, target)) return;

    chimeThenSpeak(formatRingingResetSpeech(alertingTimerNamesRef.current));

    alertingTimerNamesRef.current?.forEach((alertingTimer) =>
      resetTimerEmitter.emit(`${STOP} ${alertingTimer}`),
    );
  }

  return { handleResetAlarm };
}
