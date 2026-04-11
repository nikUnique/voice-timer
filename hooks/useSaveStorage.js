import { AppState } from "react-native";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { useUpdateTimers } from "../hooks/useUpdateTimers";
import { setItemInStorage } from "../utils/helpers";
import { getSharedObject } from "../utils/sharedVariables";

export function useSaveStorage({
  name,
  timerStartedRef,
  pausedTimeRef,
  timerStateRef,
  timeoutRef,
  timerIsActiveRef,
}) {
  let appStateBoxAlt;

  const { allTimersRef } = useRefsData();
  const { updateTimers } = useUpdateTimers();

  async function saveStorage() {
    try {
      if (AppState.currentState !== "active") {
        if (!timerIsActiveRef.current) return;

        appStateBoxAlt = "background";

        const updateObj = {
          name,
          background: "background",
          timeStarted: timerStartedRef.current,
          timePaused:
            pausedTimeRef.current > 0 ? pausedTimeRef.current : Date.now(),
          timerState: timerStateRef.current,
          timeout: timeoutRef.current,
        };

        updateTimers(updateObj);

        setItemInStorage(`background-${name}`, "background");

        setItemInStorage(`timerStarted-${name}`, {
          timeStarted: timerStartedRef.current,
          name: name,
          timePaused:
            pausedTimeRef.current > 0 ? pausedTimeRef.current : Date.now(),
        });

        setItemInStorage(`timerState-${name}`, {
          timerState: timerStateRef.current,
          name: name,
        });

        setItemInStorage(`timeout-${name}`, timeoutRef.current);

        console.log(getSharedObject().timers, "Hooobabg");

        setItemInStorage("timerHistory", getSharedObject().timers);
      }

      return appStateBoxAlt;
    } catch (error) {
      console.error("An error occured in saveStorage function 🩹", error);
    }
  }

  return { saveStorage };
}
