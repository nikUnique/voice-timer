import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Text, View } from "react-native";

import { Colors } from "../../constants/colors";
import { styles } from "./CommandsStyles";

function CommandCard({ item }) {
  const isDisabled = Boolean(item.disabled);

  return (
    <View style={[styles.card, isDisabled && styles.disabledCard]}>
      <View style={styles.iconBox}>
        <Ionicons
          name={item.icon}
          size={18}
          color={isDisabled ? Colors.grayTint20 : Colors.primaryTint40}
        />
      </View>
      <View style={styles.body}>
        <View style={[styles.badge, isDisabled && styles.disabledBadge]}>
          <Text
            style={[styles.badgeText, isDisabled && styles.disabledBadgeText]}
          >
            {isDisabled ? `${item.badge} (DISABLED)` : item.badge}
          </Text>
        </View>
        <Text style={styles.commandText}>{item.command}</Text>
        {item.example && (
          <Text style={styles.exampleText}>
            <Text style={styles.prompt}>&gt; </Text>&quot;{item.example}&quot;
          </Text>
        )}
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
    </View>
  );
}

export default memo(CommandCard);
