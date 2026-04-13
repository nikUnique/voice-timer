import { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HistoryItem from "../components/HistoryItem";
import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
} from "../context/VoiceRecognizerContext";
import { removeItemFromStorage } from "../utils/helpers";
import { updateSharedObject } from "../utils/sharedVariables";

export default function HistoryScreen() {
  const { timersHistory } = useRecognizerData();
  const { setTimersHistory } = useRefsData();

  function clearHistory() {
    setTimersHistory([]);
    updateSharedObject({
      timers: [],
    });
    removeItemFromStorage("timerHistory");
  }

  const renderItem = useCallback(({ item }) => <HistoryItem item={item} />, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={timersHistory ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={<Text style={styles.empty}>No sessions yet</Text>}
          style={{ width: "100%" }}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
        {timersHistory?.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearHistory}
          >
            <Text style={styles.clearText}>Clear all history</Text>
          </TouchableOpacity>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: Colors.primaryTint70,
    marginTop: 60,
    fontSize: 15,
  },
  clearButton: {
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.blackAlpha20,
    alignItems: "center",
  },
  clearText: {
    color: Colors.primaryTint70,
    fontSize: 14,
    fontWeight: "500",
  },
});
