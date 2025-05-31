import { useMemo } from "react";

export function useDefaultTimers() {
  const defaultTimers = useMemo(
    () => [
      {
        name: "Timer one",
        time: 300,
        createdAt: Date.now(),
        id: Math.random().toString(),
      },
    ],
    []
  );

  return { defaultTimers };
}
