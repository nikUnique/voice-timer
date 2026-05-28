import { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";

// Custom hook to track app state (foreground/background)
export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [prevAppState, setPrevAppState] = useState(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    setAppState(AppState.currentState);
    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        setPrevAppState(appState);
        setAppState(nextAppState);
      },
    );

    // Clean up the listener when the component unmounts
    return () => {
      appStateListener.remove();
    };
  }, []);

  return { appState, setAppState, appStateRef, prevAppState };
};
