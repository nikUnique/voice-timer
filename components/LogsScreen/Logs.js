import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  NativeModules,
  Share,
  Platform,
} from "react-native";
import { Colors } from "../../constants/colors";

// ---------- JS log capture (runs once when this module loads) ----------
let jsLogs = [];
const listeners = new Set();

const fmt = (a) => {
  if (typeof a === "string") return a;
  if (a instanceof Error) return a.stack || a.message;
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
};

const push = (level, args) => {
  jsLogs = [...jsLogs.slice(-199), `[${level}] ${args.map(fmt).join(" ")}`];
  listeners.forEach((l) => l());
};

if (!global.__logViewerPatched) {
  global.__logViewerPatched = true; // avoids double-patching on fast refresh
  ["log", "warn", "error"].forEach((level) => {
    const orig = console[level];
    console[level] = (...args) => {
      push(level, args);
      orig(...args);
    };
  });

  const prevHandler = global.ErrorUtils?.getGlobalHandler?.();
  global.ErrorUtils?.setGlobalHandler?.((err, isFatal) => {
    push("error", [isFatal ? "FATAL:" : "Uncaught:", err]);
    prevHandler?.(err, isFatal);
  });
}

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => jsLogs;

// ---------- UI ----------
const NOISE_TAGS = [
  "Choreographer",
  "OpenGLRenderer",
  "HWUI",
  "ViewRootImpl",
  "BufferQueueProducer",
  "InputMethodManager",
];

const tagOf = (line) => {
  const m = line.match(/^\S+\s+\S+\s+[VDIWEF]\/([^(]+)\(/);
  return m ? m[1].trim() : null;
};
const LEVELS = ["V", "D", "I", "W", "E"];
const LEVEL_COLOR = {
  V: Colors.grayTint70,
  D: Colors.primaryTint40,
  I: "#63e6be",
  W: Colors.pausedColor,
  E: Colors.dangerColor,
};

// logcat -v time line: "10-02 14:03:11.123 E/Tag( 1234): message"
const levelOf = (line) => {
  const m = line.match(/^\S+\s+\S+\s+([VDIWEF])\//);
  return m ? (m[1] === "F" ? "E" : m[1]) : null;
};

function Chip({ label, active, onPress, color }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: Colors.primaryTint8Alpha15,
          borderColor: Colors.primaryTint8Alpha30,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? color || Colors.primaryTint40 : Colors.grayTint70 },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function LogViewer({ onClose }) {
  const [source, setSource] = useState("native"); // "native" | "js"
  const [minLevel, setMinLevel] = useState("V");
  const [auto, setAuto] = useState(false);
  const [nativeText, setNativeText] = useState("");
  const js = useSyncExternalStore(subscribe, getSnapshot);
  const scrollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (Platform.OS !== "android") return;
    try {
      setNativeText(
        await NativeModules.Logcat.getLogs(
          500,
          minLevel === "V" ? "V" : minLevel,
        ),
      );
    } catch (e) {
      setNativeText(`Failed to read logcat: ${e.message}`);
    }
  }, [minLevel]);

  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    if (!auto || source !== "native") return;
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [auto, source, refresh]);

  const lines = useMemo(() => {
    const raw =
      source === "native" ? nativeText.split("\n").filter(Boolean) : js;
    const min = LEVELS.indexOf(minLevel);
    return raw.filter((l) => {
      if (source === "native" && NOISE_TAGS.includes(tagOf(l))) return false;
      const lv = levelOf(l);
      return lv === null || LEVELS.indexOf(lv) >= min;
    });
  }, [source, nativeText, js, minLevel]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
        >
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Chip
          label='Native'
          active={source === "native"}
          onPress={() => setSource("native")}
        />
        <Chip
          label='JS'
          active={source === "js"}
          onPress={() => setSource("js")}
        />
        <View style={{ flex: 1 }} />
        <Chip
          label={auto ? "Auto ●" : "Auto"}
          active={auto}
          onPress={() => setAuto((a) => !a)}
        />
      </View>

      <View style={styles.row}>
        {LEVELS.map((l) => (
          <Chip
            key={l}
            label={l}
            active={minLevel === l}
            color={LEVEL_COLOR[l]}
            onPress={() => setMinLevel(l)}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.logBox}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
      >
        {lines.map((l, i) => (
          <Text
            key={i}
            selectable
            style={[
              styles.line,
              { color: LEVEL_COLOR[levelOf(l)] || Colors.grayTint70 },
            ]}
          >
            {l}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <Pressable
          style={styles.btn}
          onPress={refresh}
        >
          <Text style={styles.btnText}>Refresh</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => Share.share({ message: lines.join("\n") })}
        >
          <Text style={styles.btnText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.grayShade30, padding: 12, gap: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.whiteAlpha10,
  },
  closeText: { color: Colors.grayTint70 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  logBox: {
    flex: 1,
    backgroundColor: Colors.grayShade20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
  },
  line: {
    fontFamily: Platform.select({ android: "monospace", ios: "Menlo" }),
    fontSize: 11,
    marginBottom: 2,
  },
  btn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
