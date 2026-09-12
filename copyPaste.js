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
import { SPACE } from "../constants/spacing";
import { FONT } from "../constants/typography";
import { Colors } from "../constants/colors";
import {
  useContactsData,
  useRefsData,
  useSettingsData,
} from "../context/VoiceRecognizerContext";
import { normalize, setItemInStorage } from "../utils/helpers";
import { callNumber } from "../utils/nativeHelpers";
import { useDictionary } from "../hooks/shared/useDictionary";
import { exists } from "react-native-fs";
import { call } from "typo-js";

const AVATAR_COLORS = [
  Colors.primaryTint8,
  Colors.pausedColor,
  Colors.resetColor,
  Colors.dangerColor,
  Colors.primary,
  Colors.primaryTint40,
];

const getInitials = (fullName) =>
  fullName
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

const getAvatarColor = (fullName) => {
  const hash = fullName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export default function ContactsScreen() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { contacts, setContacts } = useContactsData();
  const { dictionaryTypoRef } = useRefsData();
  const { setVoiceEnabled, voiceEnabled } = useSettingsData();
  const [isCorrect, setIsCorrect] = useState(true);

  const { loadDictionary } = useDictionary();

  function handleAdd() {
    const firstWord = normalize(name).split(" ")[0];
    const secondWord = normalize(name).split(" ")[1];

    const isFirstWordCorrect = dictionaryTypoRef.current.check(firstWord);
    const isSecondWordCorrect = secondWord
      ? dictionaryTypoRef.current.check(secondWord)
      : true;

    const areBothWordsCorrect = isFirstWordCorrect && isSecondWordCorrect;

    if (!areBothWordsCorrect || normalize(name).split(" ").length > 2) {
      setIsCorrect(false);
      return;
    }

    if (normalize(name).length < 3) {
      return;
    }

    const areOnlyLetters = /^[A-Za-z]+( [A-Za-z]+)?$/.test(normalize(name));

    if (!areOnlyLetters) {
      return;
    }

    const contactWithSameName = contacts.find(
      (contact) => normalize(contact.name) === normalize(name),
    );
    if (contactWithSameName && contactWithSameName.name !== name) {
      return contacts;
    }

    setIsCorrect(true);
    setName(normalize(name));

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    const newContact = { id: Date.now().toString(), name, phoneNumber };

    setContacts((prev) => [...prev, newContact]);
    setItemInStorage("contacts", [...contacts, newContact]);
    setName("");
    setPhoneNumber("");
    setError("");
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
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptyBody}>
            Add someone to call them by name.
          </Text>
        </View>
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
          {!isCorrect && !includesName && (
            <Text style={styles.error}>
              Enter 1-2 correctly spelled words using only English letters, 3
              letters minimum
            </Text>
          )}
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
            onFocus={async () => {
              setTimeout(async () => {
                await loadDictionary();
              }, 2000);
            }}
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
      ) : (
        contacts.length < 20 && (
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.buttonText}>+ Add contact</Text>
          </TouchableOpacity>
        )
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
    fontSize: FONT.lg,
    color: Colors.primaryTint90,
    fontWeight: "600",
  },
  emptyBody: {
    fontSize: FONT.sm,
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
    borderRadius: 12,
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
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACE.sm,
  },
  avatarText: {
    color: Colors.grayShade30,
    fontSize: FONT.sm,
    fontWeight: "700",
  },

  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: FONT.md,
    color: Colors.primaryTint90,
    fontWeight: "600",
  },
  rowNumber: {
    fontSize: FONT.sm,
    color: Colors.grayTint70,
    marginTop: 2,
  },

  callBadge: {
    backgroundColor: Colors.primaryTint8Alpha15,
    borderWidth: 1,
    borderColor: Colors.primaryTint8Alpha30,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: SPACE.sm,
  },
  callBadgeText: {
    color: Colors.primaryTint8,
    fontSize: FONT.xs ?? 10,
    fontWeight: "600",
  },

  deleteButton: {
    backgroundColor: Colors.dangerIconBg,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: 8,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    marginLeft: SPACE.sm,
  },
  deleteText: {
    fontSize: FONT.md,
    color: Colors.dangerColor,
  },

  form: {
    marginTop: SPACE.lg,
  },
  input: {
    fontSize: FONT.md,
    color: Colors.primaryTint90,
    backgroundColor: Colors.grayShade20,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
    borderRadius: 10,
    padding: SPACE.sm,
    marginBottom: SPACE.sm,
  },
  helperText: {
    fontSize: FONT.xs ?? 10,
    color: Colors.grayTint70,
    marginBottom: SPACE.lg,
  },
  error: {
    fontSize: FONT.sm,
    color: Colors.dangerColor,
    marginBottom: SPACE.sm,
  },

  buttonPrimary: {
    marginTop: SPACE.md,
    padding: SPACE.md,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: FONT.lg,
    color: Colors.primaryTint90,
    fontWeight: "700",
  },
});
