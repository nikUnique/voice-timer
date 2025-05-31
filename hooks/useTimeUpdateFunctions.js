import { useCallback } from "react";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { setItemInStorage } from "../utils/helpers";

export function useTimeUpdateFunctions(name, setAlertingTimers) {
  const { alertingTimerNamesRef } = useRefsData();

  const assignAlertingTimers = useCallback(
    async function () {
      alertingTimerNamesRef.current = [
        ...new Set([...alertingTimerNamesRef.current, name]),
      ];
      setAlertingTimers(alertingTimerNamesRef.current);

      // Exactly this way because we want to preserve what is in the sharedObject and also want to get the fresh update from new ref
      if (getSharedObject().alertingTimers?.length) {
        updateSharedObject({
          alertingTimers: [
            ...new Set([
              ...alertingTimerNamesRef.current,
              ...getSharedObject().alertingTimers,
            ]),
          ],
        });
      }

      if (!getSharedObject().alertingTimers?.length) {
        updateSharedObject({
          alertingTimers: [...new Set([...alertingTimerNamesRef.current])],
        });
      }

      setItemInStorage("alertingTimerNames", alertingTimerNamesRef.current);
    },
    [alertingTimerNamesRef, name]
  );

  return { assignAlertingTimers };
}
