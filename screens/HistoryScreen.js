import { Ionicons } from "@expo/vector-icons";

import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
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
import { FlashList } from "@shopify/flash-list";

export default function HistoryScreen() {
  const { timersHistory } = useRecognizerData();
  const { setTimersHistory } = useRefsData();
  const [confirmVisible, setConfirmVisible] = useState(false);

  function handleClearConfirmed() {
    setConfirmVisible(false);
    setTimersHistory([]);
    updateSharedObject({ timers: [] });
    removeItemFromStorage("timerHistory");
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={timersHistory ?? []}
          removeClippedSubviews={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={<Text style={styles.empty}>No sessions yet</Text>}
          estimatedItemSize={60}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
        {timersHistory?.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setConfirmVisible(true)}
          >
            <Text style={styles.clearText}>Clear all history</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable
            style={styles.modal}
            onPress={() => {}}
          >
            <View style={styles.modalIconBox}>
              <Ionicons
                name='trash-outline'
                size={26}
                color={Colors.dangerColor}
              />
            </View>
            <Text style={styles.modalTitle}>Clear all history?</Text>
            <Text style={styles.modalBody}>
              This will permanently remove all timer sessions. This action
              cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleClearConfirmed}
              >
                <Text style={styles.confirmText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // modal
  overlay: {
    flex: 1,
    backgroundColor: Colors.blackAlpha60,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: Colors.grayShade20,
    borderRadius: 20,
    padding: 28,
    paddingBottom: 20,
    width: "82%",
    borderWidth: 0.5,
    borderColor: Colors.whiteAlpha10,
    alignItems: "center",
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.dangerIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.primaryTint90,
    marginBottom: 8,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 13,
    color: Colors.grayTint20,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: Colors.whiteAlpha10,
  },
  cancelText: {
    color: Colors.primaryTint70,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 0.5,
    borderColor: Colors.dangerBorder,
  },
  confirmText: {
    color: Colors.dangerColor,
    fontSize: 14,
    fontWeight: "600",
  },
});
