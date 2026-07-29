import { StyleSheet, View } from "react-native";
import { Colors } from "../constants/colors";
import IconButton from "./IconButton";

const ARROW_SIZE = 30;
const ACTIVE_COLOR = Colors.primaryTint90;
const INACTIVE_COLOR = Colors.blackAlpha20;

export default function ScrollIndicator({ currentIndex, timers }) {
  const canScrollDown = currentIndex < timers.length - 1;
  const canScrollUp = currentIndex > 0;
  return (
    <View
      style={styles.container}
      pointerEvents='none'
    >
      <IconButton
        icon='chevron-up'
        size={ARROW_SIZE}
        color={canScrollUp ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      <View style={styles.gap} />
      <IconButton
        icon='chevron-down'
        size={ARROW_SIZE}
        color={canScrollDown ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 10,
    top: "34%",
    alignItems: "center",
  },
  gap: {
    height: 20,
  },
});
