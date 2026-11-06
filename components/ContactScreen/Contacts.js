import { isValidPhoneNumber } from "libphonenumber-js";
import { Alert } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Text } from "../../ui/AppText";
import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";
import {
  useContactsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { normalize, setItemInStorage } from "../../utils/helpers";
import { callNumber } from "../../utils/nativeHelpers";
import { CONTACT_LIMIT } from "../../utils/config";

import ContactRow from "./ContactRow";
import { styles } from "./ContactsStyles";

export default function Contacts() {
  const { contacts, setContacts } = useContactsData();
  const { setVoiceEnabled, voiceEnabled } = useSettingsData();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+");
  const [error, setError] = useState("");

  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  const visibleContacts = useMemo(() => {
    const q = normalize(search);
    const filtered = contacts.filter((contact) => {
      if (!q) return true;
      const haystack = `${normalize(contact.name)} ${contact.phoneNumber
        .replace(/\s/g, "")
        .toLowerCase()}`;
      return haystack.includes(q);
    });
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, search]);

  useEffect(() => {
    if (!modalVisible) return;
    const id = setTimeout(() => nameInputRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [modalVisible]);

  function resetForm() {
    setName("");
    setPhoneNumber("+");
    setError("");
  }

  function openAdd() {
    if (contacts.length >= CONTACT_LIMIT) return;
    setEditing(null);
    resetForm();
    setModalVisible(true);
  }

  function openEdit(contact) {
    setEditing(contact);
    setName(contact.name);
    setPhoneNumber(contact.phoneNumber);
    setError("");
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditing(null);
    resetForm();
  }

  function handleSave() {
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
    if (!/^[A-Za-z]+( [A-Za-z]+)?$/.test(normalizedName)) {
      setError("Name can only contain letters");
      return;
    }
    const duplicate = contacts.find(
      (contact) =>
        normalize(contact.name) === normalizedName &&
        contact.id !== editing?.id,
    );
    if (duplicate) {
      setError("Contact with this name already exists");
      return;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    const newContact = editing
      ? { ...editing, name: normalizedName, phoneNumber }
      : { id: Date.now().toString(), name: normalizedName, phoneNumber };

    const next = editing
      ? contacts.map((contact) =>
          contact.id === editing.id ? newContact : contact,
        )
      : [...contacts, newContact];

    setContacts(next);
    setItemInStorage("contacts", next);

    if (voiceEnabled) {
      setVoiceEnabled(false);
      setTimeout(() => setVoiceEnabled(true), 100);
    }
    closeModal();
  }

  async function handleCall(number) {
    const success = await callNumber(number);
    if (!success) {
      Alert.alert("Call failed", "Could not place the call.");
    }
  }

  function handleDelete(contact) {
    Alert.alert("Delete contact", `Delete ${contact.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const next = contacts.filter((c) => c.id !== contact.id);
          setContacts(next);
          setItemInStorage("contacts", next);
        },
      },
    ]);
  }

  const atLimit = contacts.length >= CONTACT_LIMIT;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Contacts</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{contacts.length}</Text>
          </View>
        </View>
        <Pressable
          style={[styles.addButton, atLimit && styles.addButtonDisabled]}
          onPress={atLimit ? undefined : openAdd}
          hitSlop={8}
        >
          <Ionicons
            name="add"
            size={FONT.heading}
            color={Colors.primaryTint90}
          />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={FONT.subheading}
          color={Colors.grayTint70}
        />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search contacts"
          placeholderTextColor={Colors.grayTint70}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={FONT.subheading}
              color={Colors.grayTint70}
            />
          </Pressable>
        ) : null}
      </View>

      {visibleContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={search ? "search-outline" : "people-outline"}
            size={FONT.display}
            color={Colors.grayTint70}
          />
          <Text style={styles.emptyTitle}>
            {search ? "No matches" : "No contacts yet"}
          </Text>
          <Text style={styles.emptyBody}>
            {search
              ? "Try a different search."
              : "Add someone to call them by name."}
          </Text>
          {!search && !atLimit ? (
            <Pressable style={styles.emptyCta} onPress={openAdd}>
              <Ionicons
                name="add"
                size={FONT.body}
                color={Colors.primaryTint90}
              />
              <Text style={styles.emptyCtaText}>Add contact</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={visibleContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactRow
              contact={item}
              onCall={handleCall}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {atLimit && !search ? (
        <Text style={styles.limitText}>
          You&apos;ve reached the {CONTACT_LIMIT} contact limit. Delete one to
          add another.
        </Text>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismiss} onPress={closeModal} />
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editing ? "Edit contact" : "Add contact"}
              </Text>
              <Pressable onPress={closeModal} hitSlop={8}>
                <Ionicons
                  name="close"
                  size={FONT.heading}
                  color={Colors.grayTint70}
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              ref={nameInputRef}
              style={styles.input}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError("");
              }}
              placeholder="John Smith"
              placeholderTextColor={Colors.grayTint70}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
            />

            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              ref={phoneInputRef}
              style={styles.input}
              value={phoneNumber}
              onChangeText={(text) => {
                if (!text) {
                  setPhoneNumber("+");
                  return;
                }
                if (!text.startsWith("+")) {
                  setPhoneNumber("+" + text.replace(/^\+/, ""));
                } else {
                  setPhoneNumber(text);
                }
              }}
              placeholder="+1 234 567 8900"
              placeholderTextColor={Colors.grayTint70}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={styles.helperText}>Include country code, e.g. +1</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSave}>
                <Text style={styles.modalSaveText}>
                  {editing ? "Save changes" : "Save contact"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
