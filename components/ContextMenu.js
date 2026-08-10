import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import { SPACE } from "../constants/spacing";
import { FONT } from "../constants/typography";
import { getSharedObject } from "../utils/sharedVariables";
import { RADIUS } from "../constants/radius";

export default function ContextMenu({ onToggleModal, modalIsVisible }) {
  const navigation = useNavigation();

  const menuItem = {
    padding: SPACE.lg,
    fontSize: FONT.body,
    color: Colors.primaryTint90,
  };
  return (
    <>
      {modalIsVisible && (
        <Pressable
          onPress={onToggleModal}
          style={styles.wrapper}
        >
          <View style={[styles.menu, { top: "9.8%", right: "3%" }]}>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimerNames.length &&
                  navigation.navigate("CommandsScreen");
                onToggleModal();
              }}
            >
              <Text style={menuItem}>Commands</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimerNames.length &&
                  navigation.navigate("SettingsScreen");
                onToggleModal();
              }}
            >
              <Text style={menuItem}>Settings</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimerNames.length &&
                  navigation.navigate("TermsScreen");
                onToggleModal();
              }}
            >
              <Text style={menuItem}>User Agreement</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimerNames.length &&
                  navigation.navigate("AboutScreen");
                onToggleModal();
              }}
            >
              <Text style={menuItem}>About</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimerNames.length &&
                  navigation.navigate("HistoryScreen");
                onToggleModal();
              }}
            >
              <Text style={menuItem}>History</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimerNames.length &&
                  navigation.navigate("AttributionScreen");
                onToggleModal();
              }}
            >
              <Text style={menuItem}>Attribution</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    backgroundColor: Colors.primaryShade30,
    borderRadius: RADIUS.chip,
    elevation: SPACE.sm,
    padding: SPACE.lg,
  },

  wrapper: {
    zIndex: 1000,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
