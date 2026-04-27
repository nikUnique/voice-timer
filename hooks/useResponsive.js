import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

// const DEV_WIDTH_OVERRIDE = __DEV__ ? 359 : null; // change this to test xs/sm/md/lg
// const DEV_HEIGHT_OVERRIDE = __DEV__ ? 640 : null; // simulate short device
const TOKENS = {
  xs: {
    labelText: 12,
    timeText: 72,
    timeSmallerText: 52,
    titleText: 62,
    padding: 10,
    radius: 8,
    gap: 8,
  },
  sm: {
    timeText: 62,
    timeSmallerText: 52,
    speechResText: 20,
    numberBtnFontSize: 30,
    numberBtnDimens: 80,
    inputValueFontSize: 36,
  },
  md: {
    labelText: 15,
    timeText: 30,
    titleText: 19,
    padding: 16,
    radius: 12,
    gap: 14,
  },
  lg: {
    labelText: 16,
    timeText: 30,
    titleText: 20,
    padding: 20,
    radius: 14,
    gap: 16,
  },
};

export function useResponsive() {
  const { width: rawWidth, height: rawHeight } = useWindowDimensions();
  const width = rawWidth;
  // const height = rawHeight;

  console.log(width + ` is the phone's width`);
  // console.log(height + ` is the phone's height`);

  const breakpoint = useMemo(
    () => (width < 360 ? "xs" : width < 414 ? "sm" : width < 480 ? "md" : "lg"),
    [width],
  );

  const t = useMemo(() => TOKENS[breakpoint], [breakpoint]);

  const scale = useMemo(
    () =>
      (xs, sm = xs, md = sm, lg = md) => {
        if (breakpoint === "xs") return xs;
        if (breakpoint === "sm") return sm;
        if (breakpoint === "md") return md;
        return lg;
      },
    [breakpoint],
  );

  return { width, breakpoint, t, scale };
}
