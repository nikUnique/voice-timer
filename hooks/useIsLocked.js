import { useEffect, useState } from "react";
import { AppState, NativeModules } from "react-native";

export function useIsLocked() {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(
    function () {
      const appStateListener = AppState.addEventListener(
        "change",
        async function load() {
          const isPhoneLocked =
            await NativeModules.NativeUtilsModule.isPhoneLocked();

          setIsLocked(isPhoneLocked);
        }
      );

      return () => appStateListener.remove();
    },
    [isLocked]
  );

  return { isLocked };
}
