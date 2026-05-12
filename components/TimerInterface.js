import { memo, useEffect, useState } from "react";

import { useExecuteCommand } from "../hooks/useExecuteCommand";
import { useLoadTimerState } from "../hooks/useLoadTimerState";
import { usePauseResume } from "../hooks/usePauseResume";
import { usePrepareEffects } from "../hooks/usePrepareEffects";
import { useResetTimer } from "../hooks/useResetTimer";
import { useResponsive } from "../hooks/useResponsive";
import { useSaveStorage } from "../hooks/useSaveStorage";
import { useStartTimer } from "../hooks/useStartTimer";
import { useTimerInterfaceFunctions } from "../hooks/useTimerInterfaceFunctions";
import { useTimerInterfaceState } from "../hooks/useTimerInterfaceState";
import { useTimeUpdate } from "../hooks/useTimeUpdate";
import { useUpdateLeastTimer } from "../hooks/useUpdateLeastTimer";
import { useUpdateNotification } from "../hooks/useUpdateNotification";
import { emitter } from "../utils/EventEmitter";
import { updateSharedObject } from "../utils/sharedVariables";
import TimerInterfaceUI from "./TimerInterfaceUI";
import { useNavigationState } from "@react-navigation/native";

function TimerInterface({
  time = 1200,
  name,
  index,
  recognizedCommand,
  lastCommandRef,
  clearCommand,
  activateTimerRef,
  handleReadyState,
  onDelete,
  timerHeight,
}) {
  const [setModalIsVisible] = useState(false);
  const timerInterfaceState = useTimerInterfaceState({ time });

  const allState = {
    name,
    index,
    time,
    recognizedCommand,
    lastCommandRef,
    clearCommand,
    activateTimerRef,
    handleReadyState,
    ...timerInterfaceState,
  };

  const { timeLeftRef, isActive, isPaused, setIsActive, resetTimerRef } =
    allState;

  const { updateLeastTimer } = useUpdateLeastTimer({
    name,
    index,
    ...allState,
  });

  console.log("Timer name", name);

  const { loadTimerState } = useLoadTimerState(allState);
  const { saveStorage } = useSaveStorage(allState);

  const { pauseListener, updatePersitentNotification, updateTimerLabel } =
    useUpdateNotification({
      ...allState,
      updateLeastTimer,
    });

  const { updateTime } = useTimeUpdate({
    ...allState,
    updateLeastTimer,
    updateTimerLabel,
  });

  usePrepareEffects({
    ...allState,
    saveStorage,
    loadTimerState,
    pauseListener,
    updatePersitentNotification,
    index,
    activateTimerRef,
  });

  usePauseResume({
    ...allState,
    pauseListener,
    updateTime,
    updateTimerLabel,
    updatePersitentNotification,
  });

  useResetTimer({
    ...allState,
    updateTimerLabel,
  });

  const { startTimer } = useStartTimer({
    ...allState,
    updateLeastTimer,
    updatePersitentNotification,
    updateTimerLabel,
    pauseListener,
    updateTime,
  });

  const { executeCommand } = useExecuteCommand({
    ...allState,
    startTimer,
  });

  useEffect(
    function () {
      executeCommand();
    },
    [recognizedCommand, lastCommandRef, executeCommand],
  );

  const { controlTimer, startChangeNameHandler } = useTimerInterfaceFunctions({
    ...allState,
    startTimer,
    setModalIsVisible,
    handleReadyState,
  });

  useEffect(
    function () {
      emitter.all.delete(`timerSelected-${index}`);
      emitter.on(`timerSelected-${index}`, () => {
        updateSharedObject({
          isActive,
          isPaused,
          name,
        });
      });

      return () => {
        emitter.all.delete(`timerSelected-${index}`);
      };
    },
    [controlTimer, index, isActive, isPaused, name, onDelete, startTimer],
  );

  const ui = (
    <TimerInterfaceUI
      timerHeight={timerHeight}
      index={index}
      isActive={isActive}
      startChangeNameHandler={startChangeNameHandler}
      name={name}
      time={time}
      activateTimerRef={activateTimerRef}
      setIsActive={setIsActive}
      startTimer={startTimer}
      isPaused={isPaused}
      resetTimerRef={resetTimerRef}
      timeLeftRef={timeLeftRef}
    />
  );

  return ui;
}

export default memo(TimerInterface);
