import { VolumeManager } from "react-native-volume-manager";
import { useRefsData } from "../../../context/VoiceRecognizerContext";
import { useCommandFeedback } from "../../shared/useCommandFeedback";
import { useControlledVolume } from "../../shared/useControlledVolume";
import { hasPhrase } from "../../../utils/helpers";

export function useVolumeCommands() {
  const { recognizedCommandRef, commandsRef } = useRefsData();

  const { chimeThenSpeak } = useCommandFeedback();

  const { adjustVolumeFromApp } = useControlledVolume();
  async function handleVolumeUp() {
    const { VOLUME_UP } = commandsRef?.current ?? {};
    if (!hasPhrase(recognizedCommandRef.current, VOLUME_UP)) return;

    const { volume } = await VolumeManager.getVolume("music");
    const percent = Math.round((volume + 0.1) * 10) / 10;
    if (percent > 1) return;

    adjustVolumeFromApp(percent);
    chimeThenSpeak(`Volume ${percent * 100}`);
  }

  async function handleVolumeDown() {
    const { VOLUME_DOWN } = commandsRef?.current ?? {};
    if (!hasPhrase(recognizedCommandRef.current, VOLUME_DOWN)) return;
    const { volume } = await VolumeManager.getVolume("music");
    const percent = Math.round((volume - 0.1) * 10) / 10;

    if (percent < 0) return;

    adjustVolumeFromApp(percent);
    chimeThenSpeak(`Volume ${percent * 100}`);
  }

  return { handleVolumeUp, handleVolumeDown };
}
