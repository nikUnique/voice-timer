import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Text, View } from "react-native";

import { Colors } from "../../constants/colors";
import { styles } from "./CommandsStyles";

function CommandCard({ item }) {
  const isDisabled = Boolean(item.disabled);
  // A command can be switched off in Settings, blocked by the current app
  // state, or both, so the notes are shown separately.
  const isUnavailable = Boolean(item.stateNote);

  return (
    <View
      style={[
        styles.card,
        isDisabled && styles.disabledCard,
        !isDisabled && isUnavailable && styles.unavailableCard,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons
          name={item.icon}
          size={18}
          color={
            isDisabled || isUnavailable
              ? Colors.grayTint20
              : Colors.primaryTint40
          }
        />
      </View>
      <View style={styles.body}>
        <View
          style={[
            styles.badge,
            (isDisabled || isUnavailable) && styles.disabledBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              (isDisabled || isUnavailable) && styles.disabledBadgeText,
            ]}
          >
            {isDisabled ? `${item.badge} (OFF)` : item.badge}
          </Text>
        </View>
        <Text style={styles.commandText}>{item.command}</Text>
        {item.example && (
          <Text style={styles.exampleText}>
            <Text style={styles.prompt}>&gt; </Text>&quot;{item.example}&quot;
          </Text>
        )}
        <Text style={styles.descriptionText}>{item.description}</Text>
        {item.settingNote && (
          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>Off: </Text>
            {item.settingNote}
          </Text>
        )}
        {item.stateNote && (
          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>Blocked: </Text>
            {item.stateNote}
          </Text>
        )}
      </View>
    </View>
  );
}

export default memo(CommandCard);
