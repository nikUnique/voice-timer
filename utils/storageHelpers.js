import { getItemFromStorage } from "./helpers";
import { getSharedObject, updateSharedObject } from "./sharedVariables";

export const updatePausedTimerNames = async function (nextAppState) {
  if (
    nextAppState === "active" &&
    getSharedObject().pausedTimerNames.length === 0
  ) {
    const pausedTimerNames = await getItemFromStorage("pausedTimerNames");
    if (pausedTimerNames) {
      updateSharedObject({ pausedTimerNames });
    }
  }
};
