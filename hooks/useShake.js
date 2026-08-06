import { useEffect } from "react";
import RNShake from "react-native-shake";

export default function useShake({ enabled = true, onShake, sensitivity }) {
  useEffect(() => {
    if (!enabled) return;
    RNShake.configure(sensitivity);

    const subscription = RNShake.addListener(onShake);

    return () => subscription.remove();
  }, [enabled, onShake, sensitivity]);
}
