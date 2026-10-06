import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";

import { Colors } from "../../constants/colors";
import { Text } from "../../ui/AppText";
import { styles } from "./CommandsStyles";

function CommandCard({ item }) {
  // One reason per card. A command can be unusable for several reasons at once,
  // and listing them separately just says "this will not work" repeatedly, so
  // the one the user can actually act on wins: a setting they can change, and
  // otherwise whatever the current state is.
  const reason = item.settingNote || item.stateNote;
  const isOff = Boolean(item.settingNote);

  return (
    <View style={[styles.card, reason && styles.disabledCard]}>
      <View style={styles.iconBox}>
        <Ionicons
          name={item.icon}
          size={18}
          color={reason ? Colors.grayTint20 : Colors.primaryTint40}
        />
      </View>
      <View style={styles.body}>
        <View style={[styles.badge, reason && styles.disabledBadge]}>
          <Text style={[styles.badgeText, reason && styles.disabledBadgeText]}>
            {item.badge}
          </Text>
        </View>
        <Text style={styles.commandText}>{item.command}</Text>
        {item.example && (
          <Text style={styles.exampleText}>
            <Text style={styles.prompt}>&gt; </Text>&quot;{item.example}&quot;
          </Text>
        )}
        <Text style={styles.descriptionText}>{item.description}</Text>
        {reason && (
          <Text style={[styles.noteText, isOff && styles.offNoteText]}>
            <Text style={styles.noteLabel}>Unavailable: </Text>
            {reason}
          </Text>
        )}
      </View>
    </View>
  );
}

export default memo(CommandCard);
