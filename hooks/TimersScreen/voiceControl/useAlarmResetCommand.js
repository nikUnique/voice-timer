import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { resetTimerEmitter } from "../../../utils/EventEmitter";
import { formatRingingResetSpeech, hasPhrase } from "../../../utils/helpers";
import { useSound } from "../../shared/useSound";
import { useSpeak } from "../../shared/useSpeak";

export function useAlarmResetCommand() {
  const { alertingTimerNamesRef } = useRecognizerData();
  const { secretIdentifierRef, recognizedCommandRef, commandsRef } =
    useRefsData();

  const { speak } = useSpeak();
  const { STOP, STOP_FINISHED } = commandsRef?.current ?? {};
  const { successSound } = useSettingsData();
  const { playSoundGeneral } = useSound();

  function handleResetAlarm() {
    const identifier = secretIdentifierRef.current
      ?.split(" ")
      .slice(2, -1)
      .join(" ");
    const target = `${STOP_FINISHED} ${identifier}`;

    if (!hasPhrase(recognizedCommandRef.current, target)) return;

    setTimeout(function () {
      playSoundGeneral({ fileName: successSound, shouldStop: false });
    }, 200);

    speak(formatRingingResetSpeech(alertingTimerNamesRef.current));

    alertingTimerNamesRef.current?.forEach((alertingTimer) =>
      resetTimerEmitter.emit(`${STOP} ${alertingTimer}`),
    );
  }

  return { handleResetAlarm };
}
