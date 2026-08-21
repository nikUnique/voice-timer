import { useEffect } from "react";
import { AppState, PermissionsAndroid } from "react-native";
import BackgroundService from "react-native-background-actions";
import { options } from "../../../utils/config";
import { backgroundTask } from "../../../utils/helpers";
import { updateSharedObject } from "../../../utils/sharedVariables";

export function useForegroundService() {
  useEffect(() => {
    let isMounted = true;
    let subscription;

    async function load() {
      const localMicroGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      if (!isMounted) return;

      const updatedOptions = localMicroGranted
        ? options
        : { ...options, foregroundServiceType: ["specialUse"] };

      const start = async () => {
        updateSharedObject({ isTaskRunning: true });
        BackgroundService.start(backgroundTask, updatedOptions);
      };

      if (AppState.currentState === "active") {
        console.log("state is active 👍");

        start();
      } else {
        subscription = AppState.addEventListener("change", (state) => {
          console.log("state is", state);

          if (state === "active") {
            start();
            subscription.remove();
          }
        });
      }
    }

    load();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);
}
