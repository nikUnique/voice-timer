import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StatusBar, StyleSheet } from "react-native";

import { Colors } from "../constants/colors";
import { BOOT_FADE_MS } from "../utils/config";
import LoadingIndicator from "../ui/LoadingIndicator";

/**
 * Full-screen branded entrance shown on cold start. While it is visible the
 * app itself renders at opacity 0 (see App.js), so nothing of the un-ready UI
 * can show through — and nothing here depends on Modal window-inset behavior,
 * which Android handles inconsistently (content recentring mid-display).
 */
export default function BootOverlay({ visible, onHidden }) {
  // Lazy state initializers keep the Animated values stable across renders
  // without reading ref.current during render (react-hooks/refs).
  const [fadeRef] = useState(() => new Animated.Value(1));
  const [pulseRef] = useState(() => new Animated.Value(0));
  const finishedRef = useRef(false);

  // Breathing pulse while the overlay is up; stops once it starts fading.
  useEffect(
    function () {
      if (!visible) return;

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseRef, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseRef, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();

      return () => pulse.stop();
    },
    [pulseRef, visible],
  );

  // Cross-fade out exactly once when visible first flips to false.
  useEffect(
    function () {
      if (visible || finishedRef.current) return;
      finishedRef.current = true;

      Animated.timing(fadeRef, {
        toValue: 0,
        duration: BOOT_FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onHidden?.();
        }
      });
    },
    [fadeRef, onHidden, visible],
  );

  const scale = pulseRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });
  const iconOpacity = pulseRef.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeRef }]}>
      <Animated.View
        style={[
          styles.brand,
          {
            opacity: iconOpacity,
            transform: [{ translateY: CENTER_COMPENSATION }, { scale }],
          },
        ]}
      >
        <LoadingIndicator />
      </Animated.View>
    </Animated.View>
  );
}

// The window decor excludes the status-bar strip on this app's Android
// configurations, so centering inside the remaining block lands half a bar
// below true screen center — pull back up by exactly that much.
const CENTER_COMPENSATION = -Math.round((StatusBar.currentHeight ?? 0) / 2);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    backgroundColor: Colors.primary,
    justifyContent: "center",
    zIndex: 100,
  },
  brand: {
    alignItems: "center",
  },
});
