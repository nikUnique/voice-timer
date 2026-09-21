import { VolumeManager } from "react-native-volume-manager";
import {
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { useSpeak } from "../../shared/useSpeak";
import { useSound } from "../../shared/useSound";
import { useControlledVolume } from "../../shared/useControlledVolume";

export function useVolumeCommands() {
  const {
    recognizedCommandRef,

    commandsRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const { VOLUME_UP, VOLUME_DOWN } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { successSound } = useSettingsData();

  const { playSoundGeneral } = useSound();

  const { adjustVolumeFromApp } = useControlledVolume();
  async function handleVolumeUp() {
    if (!recognizedCommandRef.current?.includes(VOLUME_UP)) return;

    const { volume } = await VolumeManager.getVolume("music");
    const percent = Math.round((volume + 0.1) * 10) / 10;
    if (percent > 1) return;

    adjustVolumeFromApp(percent);
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak(`Volume ${percent * 100}`);
  }

  async function handleVolumeDown() {
    if (!recognizedCommandRef.current?.includes(VOLUME_DOWN)) return;

    const { volume } = await VolumeManager.getVolume("music");
    const percent = Math.round((volume - 0.1) * 10) / 10;

    adjustVolumeFromApp(percent);
    playSoundGeneral({ fileName: successSound, shouldStop: false });
    speak(`Volume ${percent * 100}`);
  }

  return { handleVolumeUp, handleVolumeDown };
}
