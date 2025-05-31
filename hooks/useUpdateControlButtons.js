import { useCallback } from "react";
import { updateSharedObject } from "../utils/sharedVariables";
import { emitter } from "../utils/EventEmitter";

export function useUpdateControlButtons() {
  const updateControlButtons = useCallback(function (isActive, isPaused) {
    updateSharedObject({
      isActive,
      isPaused,
    });

    setTimeout(function () {
      emitter.emit(`timerInterfaceButtonsUpdate`);
    }, 0);
  }, []);

  return { updateControlButtons };
}
