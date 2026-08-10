import { Colors } from "../../constants/colors";
import { emitter } from "../../utils/EventEmitter";

import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { SPACE } from "../../constants/spacing";
import { RADIUS } from "../../constants/radius";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function formatTime(date) {
  const updatedDate = new Date(date);
  return updatedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDay(date) {
  const updatedDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    updatedDate.getFullYear(),
    updatedDate.getMonth(),
    updatedDate.getDate(),
  );
  const diff = (today - target) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)
    return updatedDate.toLocaleDateString("en-US", { weekday: "long" });
  return updatedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default memo(function HistoryItem({ item }) {
  const [timeLeft, setTimeLeft] = useState(item.time - item.duration);

  const isReset = !!item.reset;
  const isCompleted = !isReset && !!item.endTime;
  const isPaused = !isReset && !isCompleted && !!item.isPaused;
  const isRunning = !isReset && !isCompleted && !isPaused;
  const endTime = item.endTime ?? new Date();
  const pausedAt = new Date(
    new Date(item.startTime).getTime() + item.duration * 1000,
  );

  let displayDuration;
  if (isReset) {
    displayDuration = item.duration;
  }
  if (isPaused) {
    displayDuration = item.time - item.duration;
  }

  if (isRunning) {
    displayDuration = timeLeft;
  }

  if (isCompleted) {
    displayDuration = item.time;
  }

  useEffect(
    function () {
      (isRunning || isPaused) &&
        emitter.on(`timeItem-${item.label}`, (timeLeft) => {
          setTimeLeft(() => timeLeft);
        });

      return () => {
        emitter.all.delete(`timeItem-${item.label}`);
      };
    },
    [isPaused, isRunning, item.label],
  );

  return (
    <View
      style={[
        styles.card,
        isRunning && styles.cardRunning,
        isPaused && styles.cardPaused,
        isCompleted && styles.cardDone,
        isReset && styles.cardReset,
      ]}
    >
      <View
        style={[
          styles.iconBox,
          isRunning && styles.iconBoxRunning,
          isPaused && styles.iconBoxPaused,
          isCompleted && styles.iconBoxDone,
          isReset && styles.iconBoxReset,
        ]}
      >
        <Ionicons
          name={
            isRunning
              ? "timer-outline"
              : isPaused
                ? "pause-outline"
                : isReset
                  ? "refresh-outline"
                  : "checkmark-outline"
          }
          size={22}
          color={
            isRunning
              ? Colors.primaryTint40
              : isPaused
                ? Colors.pausedColor
                : isReset
                  ? Colors.resetColor
                  : Colors.primaryTint70
          }
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.label, isCompleted && styles.labelDone]}>
          {item.label + ` (${formatDuration(item.time)})`}
        </Text>
        <Text style={styles.time}>
          {formatTime(item.startTime)} —{" "}
          {isCompleted || isReset
            ? formatTime(endTime)
            : isPaused
              ? formatTime(pausedAt)
              : "now"}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.duration, isCompleted && styles.durationDone]}>
          {formatDuration(displayDuration)}
        </Text>

        {isRunning || isPaused ? (
          <View
            style={[
              styles.badge,
              isPaused ? styles.pausedBadge : styles.runningBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isPaused ? styles.pausedText : styles.runningText,
              ]}
            >
              {isPaused ? "paused" : "active"}
            </Text>
          </View>
        ) : isReset ? (
          <View style={[styles.badge, styles.resetBadge]}>
            <Text style={[styles.badgeText, styles.resetText]}>reset</Text>
          </View>
        ) : (
          <Text style={styles.day}>{formatDay(item.startTime)}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: SPACE.xl,
    padding: SPACE.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.xl,
    width: "100%",
  },
  // Running card — add a subtle border so it feels "live"
  cardRunning: {
    backgroundColor: Colors.primaryShade50,
    borderWidth: 1,
    borderColor: Colors.primaryTint40,
  },
  cardPaused: { backgroundColor: Colors.pausedShade },
  cardDone: {
    backgroundColor: Colors.doneShade,
    borderWidth: 1,
    borderColor: Colors.blackAlpha20,
  },
  cardReset: { backgroundColor: Colors.resetShade },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: Colors.blackAlpha20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxRunning: { backgroundColor: Colors.primaryShade30 },
  iconBoxPaused: { backgroundColor: Colors.pausedAlpha15 },
  iconBoxDone: { backgroundColor: "rgba(99,230,190,0.12)" }, // oc-teal-3 @ 12%
  iconBoxReset: { backgroundColor: Colors.resetAlpha15 },

  labelDone: { color: Colors.primaryTint70 },
  durationDone: { color: Colors.primaryTint70 },

  info: { flex: 1 },
  label: {
    fontSize: FONT.subheading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
  },
  time: { fontSize: FONT.caption, color: Colors.primaryTint70, marginTop: 3 },
  right: { alignItems: "flex-end" },
  duration: {
    fontSize: FONT.subheading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
  },
  day: { fontSize: FONT.caption, color: Colors.primaryTint70, marginTop: 3 },

  badge: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    marginTop: SPACE.xs,
  },
  runningBadge: { backgroundColor: Colors.primaryTint8 },
  pausedBadge: { backgroundColor: Colors.pausedAlpha20 },
  resetBadge: { backgroundColor: Colors.pausedAlpha15 },

  badgeText: { fontSize: FONT.caption, fontWeight: WEIGHT.semibold },
  runningText: { color: Colors.primaryTint90 },
  pausedText: { color: Colors.pausedColor },
  resetText: { color: Colors.resetColor },
});
