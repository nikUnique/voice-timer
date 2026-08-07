import { StyleSheet, View } from "react-native";

import { Colors } from "../constants/colors";
import IconButton from "./IconButton";
import { emitter } from "../utils/EventEmitter";

const ARROW_SIZE = 30;
const ACTIVE_COLOR = Colors.primaryTint40;
const INACTIVE_COLOR = Colors.blackAlpha20;

export default function ScrollIndicator({ currentIndex, timers, flatListRef }) {
  const canScrollDown = currentIndex < timers.length - 1;
  const canScrollUp = currentIndex > 0;
  return (
    <View style={styles.container}>
      <IconButton
        icon='arrow-up'
        size={ARROW_SIZE}
        color={canScrollUp ? ACTIVE_COLOR : INACTIVE_COLOR}
        onPress={() => {
          if (currentIndex <= 0) {
            return;
          }

          flatListRef?.current?.scrollToIndex({
            index: currentIndex - 1,
            animated: true,
          });
          emitter.emit(`timerSelected-${currentIndex - 1}`);
        }}
      />
      <View style={styles.gap} />
      <IconButton
        icon='arrow-down'
        size={ARROW_SIZE}
        color={canScrollDown ? ACTIVE_COLOR : INACTIVE_COLOR}
        onPress={() => {
          if (currentIndex >= timers.length - 1) {
            return;
          }

          flatListRef?.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
          emitter.emit(`timerSelected-${currentIndex + 1}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 8,
    top: "50",
    alignItems: "center",
    justifyContent: "center",
  },
});
