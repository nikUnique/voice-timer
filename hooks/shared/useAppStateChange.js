import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export const useAppStateChange = (onChange) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      onChangeRef.current(nextAppState);
    });

    return () => subscription.remove();
  }, []);
};
