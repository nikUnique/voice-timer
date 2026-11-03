import { useCallback } from "react";
import { ttsSpeak } from "./useTTS";

export function useSpeak() {
  const speak = useCallback((text, options = {}) => {
    if (typeof ttsSpeak.current === "function") {
      return ttsSpeak.current(text, options);
    }
    return Promise.resolve();
  }, []);
  return { speak };
}
