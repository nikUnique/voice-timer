import { isValidPhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import {
  useContactsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { normalize, setItemInStorage } from "../../utils/helpers";
import { callNumber } from "../../utils/nativeHelpers";
import { CONTACT_LIMIT } from "../../utils/config";

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

export default function Contacts() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { contacts, setContacts } = useContactsData();
  const { setVoiceEnabled, voiceEnabled } = useSettingsData();

  function handleAdd() {
    const normalizedName = normalize(name);
    const words = normalizedName.split(" ").filter(Boolean);

    if (words.length < 1 || words.length > 2) {
      setError("Name must be 1 or 2 words");
      return;
    }

    if (normalizedName.length < 3) {
      setError("Contact name should be at least 3 characters");
      return;
    }

    const areOnlyLetters = /^[A-Za-z]+( [A-Za-z]+)?$/.test(normalizedName);

    if (!areOnlyLetters) {
      setError("Name can only contain letters");
      return;
    }

    const contactWithSameName = contacts.find(
      (contact) => normalize(contact.name) === normalizedName,
    );
    if (contactWithSameName) {
      setError("Contact with this name already exists");
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    setName(normalizedName);

    const newContact = {
      id: Date.now().toString(),
      name: normalizedName,
      phoneNumber,
    };

    setContacts((prev) => [...prev, newContact]);
    setItemInStorage("contacts", [...contacts, newContact]);
    setName("");
    setPhoneNumber("");
    setShowForm(false);
    if (voiceEnabled) {
      setVoiceEnabled(false);
      setTimeout(function () {
        setVoiceEnabled(true);
      }, 100);
    }
  }

  async function handleCall(number) {
    const success = await callNumber(number);
    if (!success) setError("Could not place the call.");
  }

  function handleDelete(id) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setItemInStorage(
      "contacts",
      contacts.filter((c) => c.id !== id),
    );
  }

  const includesName = contacts.find(
    (contact) => normalize(contact.name) === normalize(name),
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior='height'
    >
      {contacts?.length === 0 ? (
        <>
          <Text style={styles.empty}>No contacts</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptyBody}>
              Add someone to call them by name.
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.listWrapper}>
          <ScrollView keyboardShouldPersistTaps='handled'>
            {contacts.map((item) => (
              <View
                key={item.id}
                style={styles.row}
              >
                <TouchableOpacity
                  style={styles.rowMain}
                  onPress={() => handleCall(item.phoneNumber)}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: getAvatarColor(item.name) },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(item.name)}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={styles.rowNumber}>{item.phoneNumber}</Text>
                  </View>
                  <View style={styles.callBadge}>
                    <Text style={styles.callBadgeText}>call</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {showForm ? (
        <View style={styles.form}>
          {includesName && (
            <Text style={styles.error}>
              Contact with this name already exists
            </Text>
          )}
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder='Name must be 1-2 words (John Smith)'
            placeholderTextColor={Colors.grayTint70}
            autoCapitalize='words'
          />
          {error !== "" && <Text style={styles.error}>{error}</Text>}
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder='Phone number (+1 234 567 8900)'
            placeholderTextColor={Colors.grayTint70}
            keyboardType='phone-pad'
          />
          <Text style={styles.helperText}>Include country code, e.g. +1</Text>

          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={handleAdd}
          >
            <Text style={styles.buttonText}>Save contact</Text>
          </TouchableOpacity>
        </View>
      ) : contacts.length >= CONTACT_LIMIT ? (
        <Text style={styles.limitText}>
          You&apos;ve reached the {CONTACT_LIMIT} contact limit. Delete one to
          add another.
        </Text>
      ) : (
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.buttonText}>+ Add contact</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACE.lg,
    marginBottom: SPACE.huge,
    backgroundColor: Colors.grayShade30,
  },

  emptyState: {
    marginTop: SPACE.huge,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: FONT.heading,
    color: Colors.primaryTint90,
    fontWeight: WEIGHT.semibold,
  },
  emptyBody: {
    fontSize: FONT.body,
    color: Colors.grayTint70,
    marginTop: SPACE.xs,
  },

  listWrapper: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.grayShade20,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.sm,
    marginBottom: SPACE.sm,
  },

  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // half of width/height for a perfect circle - doesn't map to the scale, kept as an intentional exception
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACE.sm,
  },
  avatarText: {
    color: Colors.grayShade30,
    fontSize: FONT.body,
    fontWeight: WEIGHT.bold,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: FONT.subheading,
    color: Colors.primaryTint90,
    fontWeight: WEIGHT.semibold,
  },
  rowNumber: {
    fontSize: FONT.body,
    color: Colors.grayTint70,
    marginTop: SPACE.xs,
  },
  callBadge: {
    backgroundColor: Colors.primaryTint8Alpha15,
    borderWidth: 1,
    borderColor: Colors.primaryTint8Alpha30,
    borderRadius: RADIUS.chip,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
  },
  callBadgeText: {
    color: Colors.primaryTint8,
    fontSize: FONT.caption,
    fontWeight: WEIGHT.semibold,
  },
  deleteButton: {
    backgroundColor: Colors.dangerIconBg,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: RADIUS.chip,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    marginLeft: SPACE.sm,
  },
  deleteText: {
    fontSize: FONT.subheading,
    color: Colors.dangerColor,
  },
  form: {
    marginTop: SPACE.lg,
  },
  input: {
    fontSize: FONT.subheading,
    color: Colors.primaryTint90,
    backgroundColor: Colors.grayShade20,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
    borderRadius: RADIUS.xs,
    padding: SPACE.sm,
    marginBottom: SPACE.sm,
  },

  helperText: {
    fontSize: FONT.caption,
    color: Colors.grayTint70,
    marginBottom: SPACE.lg,
  },
  error: {
    fontSize: FONT.body,
    color: Colors.dangerColor,
    marginBottom: SPACE.sm,
  },
  buttonPrimary: {
    marginTop: SPACE.md,
    padding: SPACE.md,
    backgroundColor: Colors.primary,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  buttonText: {
    fontSize: FONT.heading,
    color: Colors.primaryTint90,
    fontWeight: WEIGHT.bold,
  },
  limitText: {
    fontSize: FONT.body,
    color: Colors.grayTint70,
    textAlign: "center",
    marginTop: SPACE.md,
  },
});
