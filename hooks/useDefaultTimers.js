import { useMemo } from "react";

export function useDefaultTimers() {
  const DEFAULT_PRESETS = useMemo(
    () =>
      [
        {
          name: "fifteen seconds",
          time: 15,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "thirty seconds",
          time: 30,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "one minute",
          time: 60,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "two minutes",
          time: 120,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "three minutes",
          time: 180,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "five minutes",
          time: 300,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "ten minutes",
          time: 600,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "fifteen minutes",
          time: 900,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "twenty minutes",
          time: 1200,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "thirty minutes",
          time: 1800,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "one hour",
          time: 3600,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
        {
          name: "two hours",
          time: 7200,
          createdAt: Date.now(),
          id: Math.random().toString(),
        },
      ].sort((timerA, timerB) => timerB.time - timerA.time),
    [],
  );

  return { DEFAULT_PRESETS };
}
