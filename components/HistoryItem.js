import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatTime(date) {
  const updatedDate = new Date(date);
  console.log(updatedDate, "ourDate");
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

  console.log(updatedDate, "ourDate");

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)
    return updatedDate.toLocaleDateString("en-US", { weekday: "long" });
  return updatedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HistoryItem({ item }) {
  const isRunning = !item.endTime;
  const endTime = item.endTime ?? new Date();

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons
          name='timer-outline'
          size={22}
          color={Colors.primaryTint70}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.time}>
          {formatTime(item.startTime)} —{" "}
          {isRunning ? "now" : formatTime(endTime)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        {isRunning ? (
          <View style={styles.runningBadge}>
            <Text style={styles.runningText}>live</Text>
          </View>
        ) : (
          <Text style={styles.day}>{formatDay(item.startTime)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryShade30,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.blackAlpha20,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600", color: Colors.primaryTint90 },
  time: { fontSize: 12, color: Colors.primaryTint70, marginTop: 3 },
  right: { alignItems: "flex-end" },
  duration: { fontSize: 15, fontWeight: "600", color: Colors.primaryTint90 },
  day: { fontSize: 12, color: Colors.primaryTint70, marginTop: 3 },
  runningBadge: {
    backgroundColor: Colors.primaryTint8,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 3,
  },
  runningText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryTint90,
  },
});
