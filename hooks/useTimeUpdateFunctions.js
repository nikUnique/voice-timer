import { useCallback } from "react";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { setItemInStorage } from "../utils/helpers";
import { getSharedObject, updateSharedObject } from "../utils/sharedVariables";

export function useTimeUpdateFunctions(name, setAlertingTimersNames) {
  const { alertingTimerNamesRef } = useRefsData();

  const assignAlertingTimersNames = useCallback(
    async function () {
      alertingTimerNamesRef.current = [
        ...new Set([...alertingTimerNamesRef.current, name]),
      ];
      setAlertingTimersNames(alertingTimerNamesRef.current);

      console.log(getSharedObject().alertingTimerNames, "mdi");

      // Exactly this way because we want to preserve what is in the sharedObject and also want to get the fresh update from new ref
      if (getSharedObject().alertingTimerNames?.length) {
        updateSharedObject({
          alertingTimerNames: [
            ...new Set([
              ...alertingTimerNamesRef.current,
              ...getSharedObject().alertingTimerNames,
            ]),
          ],
        });
      }

      if (!getSharedObject().alertingTimerNames?.length) {
        updateSharedObject({
          alertingTimerNames: [...new Set([...alertingTimerNamesRef.current])],
        });
      }

      setItemInStorage("alertingTimerNames", alertingTimerNamesRef.current);

      console.log(getSharedObject().alertingTimerNames, "fudfu");
    },
    [alertingTimerNamesRef, name, setAlertingTimersNames],
  );

  return { assignAlertingTimersNames };
}
