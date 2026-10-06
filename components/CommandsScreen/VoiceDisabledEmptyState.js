import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";

import { Colors } from "../../constants/colors";
import { Text } from "../../ui/AppText";
import { styles } from "./CommandsStyles";

function VoiceDisabledEmptyState() {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyState}>
        <View style={styles.emptyStateIconBox}>
          <Ionicons
            name="mic-off-outline"
            size={32}
            color={Colors.dangerColor}
          />
        </View>
        <Text style={styles.emptyStateTitle}>Voice commands are off</Text>
        <Text style={styles.emptyStateSubtitle}>
          Turn them on in Settings to control the timer hands-free.
        </Text>
      </View>
    </View>
  );
}

export default memo(VoiceDisabledEmptyState);
