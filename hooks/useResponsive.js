import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width: rawWidth } = useWindowDimensions();
  const width = rawWidth;

  const breakpoint = useMemo(
    () => (width < 360 ? "xs" : width < 410 ? "sm" : width < 480 ? "md" : "lg"),
    [width],
  );

  const sm = breakpoint === "xs";

  const fontSize = {
    xs: sm ? 11 : 12,
    sm: sm ? 13 : 14,
    md: sm ? 15 : 16,
    lg: sm ? 17 : 18,
    xl: sm ? 20 : 22,
    xxl: sm ? 26 : 28,
    xxxl: sm ? 32 : 36,
  };

  const TOKENS = useMemo(
    () => ({
      xs: {
        timeText: 98,
        timeSmallerText: 74,
        speechResText: 24,
        numberBtnFontSize: 30,
        numberBtnDimens: 80,
        inputValueFontSize: 36,
        createBtnPadding: 24,
        playBtnPad: 20,
        sidesButtonsPad: 16,
        iconBoxSize: 44,

        display: fontSize.xxxl,
        title: fontSize.xxl,
        heading: fontSize.xl,
        subheading: fontSize.lg,
        body: fontSize.md,
        caption: fontSize.sm,
        label: fontSize.xs,
      },
      sm: {
        timeText: 110,
        timeSmallerText: 86,
        speechResText: 30,
        numberBtnFontSize: 30,
        numberBtnDimens: 94,
        inputValueFontSize: 36,
        createBtnPadding: 32,
        playBtnPad: 24,
        sidesButtonsPad: 16,

        iconBoxSize: 44,
        display: fontSize.xxxl,
        title: fontSize.xxl,
        heading: fontSize.xl,
        subheading: fontSize.lg,
        body: fontSize.md,
        caption: fontSize.sm,
        label: fontSize.xs,
      },
      md: {
        timeText: 134,
        timeSmallerText: 98,
        speechResText: 30,
        numberBtnFontSize: 44,
        numberBtnDimens: 98,
        inputValueFontSize: 62,
        createBtnPadding: 34,
        playBtnPad: 32,
        sidesButtonsPad: 24,
        display: fontSize.xxxl,
        title: fontSize.xxl,
        heading: fontSize.xl,
        subheading: fontSize.lg,
        body: fontSize.md,
        caption: fontSize.sm,
        label: fontSize.xs,
        iconBoxSize: 44,
      },
      lg: {
        timeText: 134,
        timeSmallerText: 110,
        speechResText: 30,
        numberBtnFontSize: 44,
        numberBtnDimens: 124,
        inputValueFontSize: 62,
        createBtnPadding: 48,
        playBtnPad: 40,
        sidesButtonsPad: 28,
        display: fontSize.xxxl,
        title: fontSize.xxl,
        heading: fontSize.xl,
        subheading: fontSize.lg,
        body: fontSize.md,
        caption: fontSize.sm,
        label: fontSize.xs,

        iconBoxSize: 52,
      },
    }),
    [fontSize.lg, fontSize.md, fontSize.sm, fontSize.xl, fontSize.xs, fontSize.xxl, fontSize.xxxl],
  );

  console.log(width + ` is the phone's width`);
  console.log(breakpoint + " size");

  const t = useMemo(() => TOKENS[breakpoint], [TOKENS, breakpoint]);

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
