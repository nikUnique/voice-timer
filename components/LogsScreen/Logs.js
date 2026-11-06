import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  FlatList,
  NativeModules,
  Platform,
  Pressable,
  Share,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { Text } from "../../ui/AppText";

import { styles } from "./LogsStyles";

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
  jsLogs = [...jsLogs.slice(-499), `[${level}] ${args.map(fmt).join(" ")}`];
  listeners.forEach((l) => l());
};

const clearJsLogs = () => {
  jsLogs = [];
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

// ---------- helpers ----------
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
  I: Colors.doneColor,
  W: Colors.pausedColor,
  E: Colors.dangerColor,
};

// logcat -v time line: "10-02 14:03:11.123 E/Tag( 1234): message"
const levelOf = (line) => {
  const m = line.match(/^\S+\s+\S+\s+([VDIWEF])\//);
  return m ? (m[1] === "F" ? "E" : m[1]) : null;
};

// ---------- UI ----------
const LogLine = memo(function LogLine({ line, level, striped }) {
  return (
    <View style={[styles.logRow, striped && styles.logRowStriped]}>
      <Text
        selectable
        style={[
          styles.line,
          { color: LEVEL_COLOR[level] || Colors.grayTint70 },
        ]}
      >
        {line}
      </Text>
    </View>
  );
});

function Chip({ label, active, onPress, color, leading }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      {leading ? (
        <View
          style={[
            styles.chipDot,
            { backgroundColor: color || Colors.primaryTint40 },
          ]}
        />
      ) : null}
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
  const stickToBottomRef = useRef(true);

  const refresh = useCallback(async () => {
    if (Platform.OS !== "android") return;
    try {
      setNativeText(
        await NativeModules.Logcat.getLogs(
          5000,
          minLevel === "V" ? "V" : minLevel,
        ),
      );
    } catch (e) {
      setNativeText(`Failed to read logcat: ${e.message}`);
    }
  }, [minLevel]);

  useEffect(() => {
    Promise.resolve().then(refresh);
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

  const onScroll = useCallback((e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distance =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    stickToBottomRef.current = distance < 40;
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [lines]);

  const renderLine = useCallback(
    ({ item, index }) => (
      <LogLine line={item} level={levelOf(item)} striped={index % 2 === 1} />
    ),
    [],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{lines.length} lines</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.segmented}>
          <Chip
            label="Native"
            active={source === "native"}
            onPress={() => setSource("native")}
          />
          <Chip
            label="JS"
            active={source === "js"}
            onPress={() => setSource("js")}
          />
        </View>
        <View style={styles.spacer} />
        <Chip
          label={auto ? "Auto ●" : "Auto"}
          active={auto}
          onPress={() => setAuto((a) => !a)}
        />
      </View>

      <View style={styles.levelRow}>
        {LEVELS.map((l) => (
          <Chip
            key={l}
            label={l}
            active={minLevel === l}
            color={LEVEL_COLOR[l]}
            leading
            onPress={() => setMinLevel(l)}
          />
        ))}
      </View>

      <View style={styles.logBox}>
        <FlatList
          ref={scrollRef}
          data={lines}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderLine}
          onScroll={onScroll}
          scrollEventThrottle={16}
          initialNumToRender={30}
          maxToRenderPerBatch={20}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={styles.logContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No logs matching the filter</Text>
          }
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.btnPrimary} onPress={refresh}>
          <Text style={styles.btnPrimaryText}>Refresh</Text>
        </Pressable>
        <Pressable
          style={styles.btnSecondary}
          onPress={() => Share.share({ message: lines.join("\n") })}
        >
          <Text style={styles.btnSecondaryText}>Share</Text>
        </Pressable>
        {source === "js" ? (
          <Pressable style={styles.btnSecondary} onPress={clearJsLogs}>
            <Text style={styles.btnSecondaryText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
