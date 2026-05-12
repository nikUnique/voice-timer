import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width: rawWidth } = useWindowDimensions();
  const width = rawWidth;

  const breakpoint = useMemo(
    () => (width < 360 ? "xs" : width < 410 ? "sm" : width < 480 ? "md" : "lg"),
    [width],
  );

  const TOKENS = useMemo(
    () => ({
      display: 34,
      title: 24,
      heading: 20,
      subheading: 16,
      body: 14,
      caption: 12,
      label: 12,
    }),
    [],
  );

  const t = useMemo(() => TOKENS, [TOKENS]);

  return { width, breakpoint, t };
}
