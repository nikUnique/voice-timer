import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

import { Colors } from "../constants/colors";
import { WEIGHT } from "../constants/weight";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ExpandableSetting({
  label,
  description,
  labelStyle,
  descriptionStyle,
  collapsedLines = 2,
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(function () {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={labelStyle}>{label}</Text>
      <Text
        style={descriptionStyle}
        numberOfLines={expanded ? undefined : collapsedLines}
      >
        {description}
      </Text>
      <Pressable onPress={toggleExpanded}>
        <Text style={styles.toggleText}>
          {expanded ? "Show less" : "Show more"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
  },
  toggleText: {
    color: Colors.primaryTint90,
    fontWeight: WEIGHT.semibold,
  },
});
