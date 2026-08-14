import { useCallback, useEffect } from "react";
import { AppState } from "react-native";

import { emitter } from "../../../utils/EventEmitter";
import { updateSharedObject } from "../../../utils/sharedVariables";

export function usePrepareEffects({
  saveStorage,
  loadTimerState,
  name,
  pauseTimerRef,
  resumeTimerRef,
  updatePersistentNotification,
  timerIsActiveRef,
  timeLeftRef,
}) {
  useEffect(
    function () {
      emitter.all.delete(`updateNotification-${name}`);
      emitter.on(`updateNotification-${name}`, updatePersistentNotification);
    },

    [name, pauseTimerRef, resumeTimerRef, updatePersistentNotification],
  );

  const load = useCallback(
    async function load() {
      if (AppState.currentState === "active") {
        const newAppState = await loadTimerState();
        updateSharedObject({ appStateBox: newAppState });
      }
    },
    [loadTimerState],
  );

  useEffect(
    function () {
      load();
      const appStateListener = AppState.addEventListener("change", load);

      return () => appStateListener.remove();
    },
    [load, loadTimerState],
  );

  useEffect(
    function () {
      const appStateListener = AppState.addEventListener("change", async () => {
        if (AppState.currentState === "background" && timeLeftRef.current > 0) {
          const newAppState = await saveStorage();

          updateSharedObject({ appStateBox: newAppState });
        }
      });
      return () => {
        appStateListener.remove();
      };
    },
    [name, saveStorage, timeLeftRef, timerIsActiveRef],
  );
}
