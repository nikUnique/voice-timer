import { Platform, StyleSheet } from "react-native";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.grayShade30,
    padding: SPACE.lg,
    gap: SPACE.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: Colors.primaryTint90,
    fontSize: FONT.heading,
    fontWeight: WEIGHT.semibold,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
  },
  countBadge: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.full,
    backgroundColor: Colors.whiteAlpha10,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
  },
  countText: {
    color: Colors.grayTint70,
    fontSize: FONT.caption,
    fontWeight: WEIGHT.medium,
  },
  closeBtn: {
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.md,
    borderRadius: RADIUS.chip,
    backgroundColor: Colors.whiteAlpha10,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
  },
  closeText: {
    color: Colors.grayTint70,
    fontSize: FONT.body,
    fontWeight: WEIGHT.medium,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
  },
  segmented: {
    flexDirection: "row",
    gap: SPACE.xs,
    padding: SPACE.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.grayShade20,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
  },
  spacer: { flex: 1 },
  levelRow: {
    flexDirection: "row",
    gap: SPACE.sm,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.xs,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
    backgroundColor: Colors.whiteAlpha10,
  },
  chipActive: {
    backgroundColor: Colors.primaryTint8Alpha15,
    borderColor: Colors.primaryTint8Alpha30,
  },
  chipDot: {
    width: SPACE.sm,
    height: SPACE.sm,
    borderRadius: RADIUS.full,
  },
  chipText: {
    fontSize: FONT.body,
    fontWeight: WEIGHT.medium,
  },
  logBox: {
    flex: 1,
    backgroundColor: Colors.grayShade20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
    overflow: "hidden",
  },
  logContent: {
    padding: SPACE.md,
  },
  logRow: {
    paddingVertical: SPACE.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha10,
  },
  logRowStriped: {
    backgroundColor: Colors.whiteAlpha10,
  },
  line: {
    fontFamily: Platform.select({ android: "monospace", ios: "Menlo" }),
    fontSize: FONT.caption,
    lineHeight: 16,
  },
  emptyText: {
    color: Colors.grayTint70,
    fontSize: FONT.body,
    textAlign: "center",
    paddingVertical: SPACE.xxxl,
  },
  footer: {
    flexDirection: "row",
    gap: SPACE.md,
  },
  btnPrimary: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACE.lg,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.primary,
  },
  btnPrimaryText: {
    color: Colors.primaryTint90,
    fontSize: FONT.body,
    fontWeight: WEIGHT.semibold,
  },
  btnSecondary: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACE.lg,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.whiteAlpha10,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
  },
  btnSecondaryText: {
    color: Colors.grayTint70,
    fontSize: FONT.body,
    fontWeight: WEIGHT.medium,
  },
});
