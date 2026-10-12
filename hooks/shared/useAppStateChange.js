import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export const useAppStateChange = (onChange) => {
  const onChangeRef = useRef(onChange);

  // Keep the ref pointed at the latest onChange without re-subscribing.
  // Written in an effect, not during render, per the react-hooks/refs rule.
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      onChangeRef.current(nextAppState);
    });

    return () => subscription.remove();
  }, []);
};
