import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import { FONT } from "../constants/typography";
import {
  useRecognizerData,
  useRefsData,
} from "../context/VoiceRecognizerContext";
import { Text } from "../ui/AppText";
import { removeItemFromStorage } from "../utils/helpers";
import { updateSharedObject } from "../utils/sharedVariables";
import HistoryItem from "./HistoryItem";
import { SPACE } from "../constants/spacing";
import { RADIUS } from "../constants/radius";
import { WEIGHT } from "../constants/weight";

export default function History({ navigation }) {
  const { timersHistory } = useRecognizerData();
  const { setTimersHistory } = useRefsData();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isListReady, setIsListReady] = useState(false);

  useEffect(function () {
    const id = setTimeout(() => setIsListReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      setIsListReady(false);
    });
    return unsub;
  }, [navigation]);

  function handleClearConfirmed() {
    setConfirmVisible(false);
    setTimersHistory([]);
    updateSharedObject({ timers: [] });
    removeItemFromStorage("timerHistory");
  }

  const renderItem = useCallback(function ({ item }) {
    return <HistoryItem item={item} />;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {!isListReady ? (
        <ActivityIndicator
          size='large'
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          color={Colors.primaryTint90}
        />
      ) : (
        <>
          <View style={styles.container}>
            <FlatList
              data={timersHistory ?? []}
              removeClippedSubviews={false}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListEmptyComponent={
                <Text style={styles.empty}>No sessions yet</Text>
              }
              estimatedItemSize={60}
              contentContainerStyle={{ paddingBottom: 40 }}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
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
                    size={FONT.title}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACE.xl,
    paddingTop: SPACE.xxl,
    paddingBottom: SPACE.xxl,
  },
  empty: {
    textAlign: "center",
    color: Colors.primaryTint70,
    marginTop: SPACE.massive,
    fontSize: FONT.body,
  },
  clearButton: {
    marginTop: SPACE.lg,
    marginBottom: SPACE.md,
    padding: SPACE.lg,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.blackAlpha20,
    alignItems: "center",
  },
  clearText: {
    color: Colors.primaryTint70,
    fontSize: FONT.body,
    fontWeight: WEIGHT.medium,
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
    borderRadius: RADIUS.md,
    padding: SPACE.xxxl,
    paddingBottom: SPACE.xxl,
    width: "82%",
    borderWidth: 0.5,
    borderColor: Colors.whiteAlpha10,
    alignItems: "center",
  },
  modalIconBox: {
    width: 52,
    minHeight: 52,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.dangerIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACE.xl,
  },
  modalTitle: {
    fontSize: FONT.subheading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
    marginBottom: SPACE.md,
    textAlign: "center",
  },
  modalBody: {
    fontSize: FONT.body,
    color: Colors.grayTint20,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACE.xxl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: SPACE.lg,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    padding: SPACE.lg,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: Colors.whiteAlpha10,
  },
  cancelText: {
    color: Colors.primaryTint70,
    fontSize: FONT.body,
    fontWeight: WEIGHT.semibold,
  },
  confirmBtn: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 0.5,
    borderColor: Colors.dangerBorder,
  },
  confirmText: {
    color: Colors.dangerColor,
    fontSize: FONT.body,
    fontWeight: WEIGHT.semibold,
  },
});
