import { useNavigation } from "@react-navigation/native";
import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import { getSharedObject } from "../utils/sharedVariables";

export default function ContextMenu({ onToggleModal, modalIsVisible }) {
  const navigation = useNavigation();

  return (
    <>
      {modalIsVisible && (
        <Pressable onPress={onToggleModal} style={styles.wrapper}>
          <View style={[styles.menu, { top: "9.8%", right: "3%" }]}>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimers.length &&
                  navigation.navigate("CommandsScreen");
                onToggleModal();
              }}
            >
              <Text style={styles.menuItem}>Commands</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimers.length &&
                  navigation.navigate("SettingsScreen");
                onToggleModal();
              }}
            >
              <Text style={styles.menuItem}>Settings</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimers.length &&
                  navigation.navigate("TermsScreen");
                onToggleModal();
              }}
            >
              <Text style={styles.menuItem}>User Agreement</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                !getSharedObject().alertingTimers.length &&
                  navigation.navigate("AboutScreen");
                onToggleModal();
              }}
            >
              <Text style={styles.menuItem}>About</Text>
            </Pressable>

            {/* <Pressable
              onPress={() => {
                navigation.navigate("AttributionScreen");
                onToggleModal();
              }}
            >
              <Text style={styles.menuItem}>Attributions</Text>
            </Pressable> */}
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    // top: 80,
    // right: 10,
    backgroundColor: Colors.primaryShade30,
    borderRadius: 8,
    width: 170,
    elevation: 5,
    padding: 10,
  },
  menuItem: {
    padding: 10,
    fontSize: 16,
    color: Colors.primaryTint90,
  },

  wrapper: {
    zIndex: 1000,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
