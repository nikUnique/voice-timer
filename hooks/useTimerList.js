import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { updateSharedObject } from "../utils/sharedVariables";
import { setItemInStorage, sleep } from "../utils/helpers";
import { useNavigation } from "@react-navigation/native";

export function useTimerList({
  timers,
  setTimers,
  setIsReady,
  setRecognizedCommand,
}) {
  const navigation = useNavigation();
  const handleDelete = useCallback(
    function handleDelete(timerName) {
      try {
        const timerToDelete = timers.find(
          (timer) => timer?.name.toLowerCase() === timerName.toLowerCase(),
        );

        let initialIndex = timers.findIndex(
          (timer) => timer?.name?.toLowerCase() === timerName.toLowerCase(),
        );

        let timerToDeleteIndex = initialIndex;

        const newTimersArray = timers.filter(
          (timer) => timer?.name !== timerToDelete?.name,
        );

        // It will be always less one index than the deletable item was, and in case if the item with index 0 was deleted, the selected item will be undefined because of -1 index, but when that happens the list is automatically scrolled by default to show another item where onScroll callback on the FlatList kicks in and updates the shared object with the name of the currently viewed timer
        let newSelectedTimer = timers[timerToDeleteIndex - 1];

        updateSharedObject({ name: newSelectedTimer?.name });

        setTimers(newTimersArray);
        setItemInStorage("timers", newTimersArray);

        if (!newTimersArray?.length) {
          navigation.replace("CreateTimerScreen");
        }
      } catch (error) {
        console.error(`An error occurred in the handleDelete function`, error);
      }
    },
    [navigation, setTimers, timers],
  );

  const handleReadyState = useCallback(async function (isReady = true) {
    setIsReady(isReady);
    await sleep(0.25);
    await SplashScreen.hideAsync();
  }, []);

  const clearCommand = useCallback(function () {
    setRecognizedCommand(" ");
  }, []);
  return { handleDelete, handleReadyState, clearCommand };
}
