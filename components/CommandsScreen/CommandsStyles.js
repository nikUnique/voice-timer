import { StyleSheet } from "react-native";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACE.xl,
  },
  list: {
    flex: 1,
  },
  title: {
    fontSize: FONT.heading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
    marginBottom: SPACE.xl,
  },
  subtitle: {
    fontSize: FONT.subheading,
    color: Colors.primaryTint70,
    marginBottom: SPACE.xxl,
  },
  legend: {
    backgroundColor: Colors.grayShade30,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
    padding: SPACE.lg,
    gap: SPACE.sm,
    marginBottom: SPACE.xxl,
  },
  legendTitle: {
    fontSize: FONT.body,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
  },
  legendText: {
    fontSize: FONT.caption,
    color: Colors.primaryTint70,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.primaryShade50,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingVertical: SPACE.xl,
    paddingRight: SPACE.xl,
    paddingLeft: SPACE.lg,
    flexDirection: "row",
    gap: SPACE.xl,
    marginBottom: SPACE.lg,
  },
  disabledCard: {
    opacity: 0.8,
    borderLeftColor: Colors.grayTint20,
  },
  unavailableCard: {
    borderLeftColor: Colors.pausedColor,
  },
  body: {
    flex: 1,
    gap: SPACE.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.primaryTint8Alpha15,
    borderWidth: 1,
    borderColor: Colors.primaryTint8Alpha30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACE.xs,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primaryTint40Alpha40,
    borderRadius: RADIUS.tight,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    backgroundColor: Colors.primaryTint40Alpha8,
    marginBottom: SPACE.xs,
  },
  disabledBadge: {
    borderColor: Colors.grayTint20,
    backgroundColor: "transparent",
  },
  badgeText: {
    fontSize: FONT.caption,
    letterSpacing: 1.1,
    color: Colors.primaryTint40,
  },
  disabledBadgeText: {
    color: Colors.grayTint20,
  },
  commandText: {
    fontSize: FONT.body,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
  },
  exampleText: {
    fontSize: FONT.caption,
    color: Colors.primaryTint8,
  },
  descriptionText: {
    fontSize: FONT.caption,
    color: Colors.primaryTint40,
    lineHeight: 18,
  },
  noteText: {
    fontSize: FONT.caption,
    color: Colors.pausedColor,
    lineHeight: 18,
  },
  noteLabel: {
    fontWeight: WEIGHT.semibold,
  },
  prompt: {
    color: Colors.primaryShade30,
    fontWeight: WEIGHT.bold,
    fontSize: FONT.body,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.xxl,
  },
  emptyState: {
    alignItems: "center",
    gap: SPACE.lg,
  },
  emptyStateIconBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACE.sm,
  },
  emptyStateTitle: {
    fontSize: FONT.subheading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: FONT.body,
    color: Colors.primaryTint90,
    textAlign: "center",
    lineHeight: 20,
  },
});
