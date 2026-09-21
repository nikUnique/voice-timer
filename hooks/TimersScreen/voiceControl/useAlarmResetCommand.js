import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { resetTimerEmitter } from "../../../utils/EventEmitter";
import { formatRingingResetSpeech } from "../../../utils/helpers";
import { useSound } from "../../shared/useSound";
import { useSpeak } from "../../shared/useSpeak";

export function useAlarmResetCommand() {
  const { alertingTimerNamesRef } = useRecognizerData();
  const {
    secretIdentifierRef,
    recognizedCommandRef,

    commandsRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const { STOP, STOP_FINISHED } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { successSound } = useSettingsData();

  const { playSoundGeneral } = useSound();

  function handleResetAlarm() {
    const target =
      `${STOP_FINISHED} ${secretIdentifierRef.current?.split(" ").slice(2, -1)}`.trim();
    if (!recognizedCommandRef.current?.toLowerCase().includes(target)) return;

    setTimeout(function () {
      playSoundGeneral({ fileName: successSound, shouldStop: false });
    }, 200);

    speak(formatRingingResetSpeech(alertingTimerNamesRef.current));

    alertingTimerNamesRef?.current?.map((alertingTimer) =>
      resetTimerEmitter.emit(`${STOP} ${alertingTimer}`),
    );
  }

  return { handleResetAlarm };
}
