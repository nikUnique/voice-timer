import { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";

export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [prevAppState, setPrevAppState] = useState(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setPrevAppState(appStateRef.current);
      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, []);

  return { appState, prevAppState };
};
