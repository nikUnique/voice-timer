import { useEffect, useRef } from "react";
import { VolumeManager } from "react-native-volume-manager";
import { useSettingsData } from "../../context/VoiceRecognizerContext";

export function useControlledVolume() {
  const { isHeadsetBroken } = useSettingsData();
  const lastVolume = useRef(null);
  const isAppChange = useRef(false);

  useEffect(() => {
    VolumeManager.getVolume().then(({ volume }) => {
      lastVolume.current = volume;
    });

    const subscription = VolumeManager.addVolumeListener((result) => {
      if (result.type !== "music") {
        return;
      }
      if (isAppChange.current) {
        lastVolume.current = result.volume;
        isAppChange.current = false;
        return;
      }

      if (isHeadsetBroken) {
        VolumeManager.setVolume(lastVolume.current, {
          type: "music",
          showUI: false,
        });
      } else {
        lastVolume.current = result.volume;
      }
    });

    return () => subscription.remove();
  }, [isHeadsetBroken]);

  const adjustVolumeFromApp = async (newVolume) => {
    isAppChange.current = true;
    await VolumeManager.setVolume(newVolume, { type: "music", showUI: true });
  };

  return { adjustVolumeFromApp };
}
