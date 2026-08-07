import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

function IconButton({ onPress, icon, color, size, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={(({ pressed }) => pressed && styles.pressed, styles.pressable)}
    >
      <View style={style}>
        <Ionicons
          name={icon}
          color={color}
          size={size}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },

  pressable: {
    // backgroundColor: "blue",
  },
});

export default IconButton;
