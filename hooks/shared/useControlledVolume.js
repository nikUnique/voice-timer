import { useEffect, useRef } from "react";
import { VolumeManager } from "react-native-volume-manager";
import { useSettingsData } from "../../context/VoiceRecognizerContext";
import { NativeEventEmitter, NativeModules } from "react-native";

const volumeEmitter = new NativeEventEmitter(NativeModules.VolumeObserver);
export function useControlledVolume() {
  const { isHeadsetBroken } = useSettingsData();
  const lastVolume = useRef(null);
  const isAppChange = useRef(false);

  useEffect(() => {
    NativeModules.VolumeObserver.startObserving();
    VolumeManager.getVolume().then(({ volume }) => {
      lastVolume.current = volume;
    });

    const subscription = volumeEmitter.addListener(
      "volumeChanged",
      (result) => {
        if (isAppChange.current) {
          lastVolume.current = result.volume;
          isAppChange.current = false;
          return;
        }

        if (isHeadsetBroken) {
          console.log("lastVolumeRef", lastVolume.current);

          NativeModules.VolumeObserver.setVolume(lastVolume.current);
        } else {
          lastVolume.current = result.volume;
        }
      },
    );

    return () => {
      NativeModules.VolumeObserver.stopObserving();
      subscription.remove();
    };
  }, [isHeadsetBroken]);

  const adjustVolumeFromApp = async (newVolume) => {
    isAppChange.current = true;
    await VolumeManager.setVolume(newVolume, { type: "music", showUI: true });
  };

  return { adjustVolumeFromApp };
}
