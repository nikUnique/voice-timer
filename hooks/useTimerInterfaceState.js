import { useMemo, useRef, useState } from "react";

export function useTimerInterfaceState({ time }) {
  // Timer state
  const [isAlarming, setIsAlarming] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const timerStateRef = useRef("completed");
  const timerIsActiveRef = useRef(false);
  const timeLeftRef = useRef(time);
  const timeoutRef = useRef(null);

  // Command execution
  const isBusyRef = useRef(false);

  // Sound
  const soundIsPlayedRef = useRef(false);
  const startNewTimerRef = useRef(false);

  // Handlers
  const resumeTimerRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const startTimerRef = useRef(null);

  // Timestamps
  const timerStartedRef = useRef(null);
  const pausedTimeRef = useRef(null);

  // Notification
  const timeLabelRef = useRef(null);

  const allState = useMemo(
    () => ({
      isAlarming,
      setIsAlarming,
      isReset,
      setIsReset,
      isBusyRef,
      timeLeftRef,
      isPausedRef,
      soundIsPlayedRef,
      startNewTimerRef,
      resumeTimerRef,
      isActive,
      setIsActive,
      isPaused,
      setIsPaused,
      timerStateRef,
      timerStartedRef,
      startTimerRef,
      pausedTimeRef,
      resetTimerRef,
      timerIsActiveRef,
      timeoutRef,
      timeLabelRef,
      pauseTimerRef,
    }),
    [isActive, isAlarming, isPaused, isReset],
  );

  return allState;
}
