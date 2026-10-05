import { useCallback, useEffect } from "react";

import { emitter } from "../../../utils/EventEmitter";

export function useTimerInterfaceFunctions({
  isActive,
  startTimer,
  pauseTimerRef,
  isPaused,
  resumeTimerRef,
  name,
  modalIsVisible,
}) {

  const controlTimer = useCallback(
    async function () {
      if (!isActive) {
        await startTimer();
        return;
      }
      if (isActive && !isPaused) {
        pauseTimerRef.current();
        return;
      }

      if (isActive && isPaused) {
        resumeTimerRef.current();
      }
    },
    [isActive, isPaused, pauseTimerRef, resumeTimerRef, startTimer],
  );

  useEffect(
    function () {
      // This is needed for general buttons on the screen to have right functions to execute based on the currently viewed timer
      emitter.all.delete(`controlTimer-${name}`);
      emitter.on(`controlTimer-${name}`, controlTimer);
    },
    [controlTimer, name],
  );

  async function startChangeNameHandler() {
    emitter.emit("navigation", {
      screen: "ChangeTimerNameScreen",
      name,
      modalIsVisible,
      onModalIsVisible: startChangeNameHandler,
    });
  }

  return {
    controlTimer,
    startChangeNameHandler,
  };
}
