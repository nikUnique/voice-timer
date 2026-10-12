import { useCallback, useEffect } from "react";
import { AppState } from "react-native";

import { emitter } from "../../../utils/EventEmitter";

export function usePrepareEffects({
  saveStorage,
  loadTimerState,
  name,
  time,
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
        // Fresh props passed as arguments: loadTimerState keeps a stable
        // identity (no reload loop) while always reading current values.
        await loadTimerState(name, time);
      }
    },
    [loadTimerState, name, time],
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
          await saveStorage();
        }
      });
      return () => {
        appStateListener.remove();
      };
    },
    [name, saveStorage, timeLeftRef, timerIsActiveRef],
  );
}
