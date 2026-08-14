import { useCallback } from "react";
import { useRefsData } from "../../../context/VoiceRecognizerContext";
import { setItemInStorage } from "../../../utils/helpers";

export function useUpdateTimers() {
  const { allTimersRef } = useRefsData();

  const updateTimers = useCallback(
    (updateObj) => {
      allTimersRef.current = allTimersRef.current.map((timer) => {
        return timer.name === updateObj.name
          ? { ...timer, ...updateObj }
          : timer;
      });

      setItemInStorage("state", allTimersRef.current);
    },
    [allTimersRef],
  );

  return { updateTimers };
}
