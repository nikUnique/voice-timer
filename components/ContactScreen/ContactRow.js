import { memo } from "react";
import { Pressable, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";
import { Text } from "../../ui/AppText";
import { styles } from "./ContactsStyles";

const AVATAR_COLORS = [
  Colors.primaryTint8,
  Colors.pausedColor,
  Colors.resetColor,
  Colors.dangerColor,
  Colors.primary,
  Colors.primaryTint40,
];

function getInitials(fullName) {
  return fullName
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getAvatarColor(fullName) {
  const hash = fullName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const ContactRow = memo(function ContactRow({
  contact,
  onCall,
  onEdit,
  onDelete,
}) {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: getAvatarColor(contact.name) },
        ]}
      >
        <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.rowNumber} numberOfLines={1}>
          {contact.phoneNumber}
        </Text>
      </View>

      <View style={styles.rowActions}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => onEdit(contact)}
          hitSlop={8}
        >
          <Ionicons
            name="pencil-outline"
            size={FONT.subheading}
            color={Colors.primaryTint40}
          />
        </Pressable>
        <Pressable
          style={styles.iconBtnPrimary}
          onPress={() => onCall(contact.phoneNumber)}
          hitSlop={8}
        >
          <Ionicons
            name="call"
            size={FONT.subheading}
            color={Colors.primaryTint90}
          />
        </Pressable>
        <Pressable
          style={styles.iconBtnDanger}
          onPress={() => onDelete(contact)}
          hitSlop={8}
        >
          <Ionicons
            name="trash-outline"
            size={FONT.subheading}
            color={Colors.dangerColor}
          />
        </Pressable>
      </View>
    </View>
  );
});

export default ContactRow;
