/* eslint-disable react-native/no-raw-text */
import { useNavigation } from "@react-navigation/native";
import Dialog from "react-native-dialog";

import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import { getItemFromStorage, setItemInStorage } from "../utils/helpers";

export default function AgreementAlert() {
  const navigation = useNavigation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [pressed, setIsPressed] = useState(false);

  const showDialog = () => {
    setDialogVisible(true);
  };

  const hideDialog = () => {
    BackHandler.exitApp();
  };

  function goToTermsScreen() {
    setDialogVisible(false);
    navigation.navigate("TermsScreen");
  }

  useEffect(
    function () {
      async function load() {
        const termsAgreement = await getItemFromStorage("termsAgreement");
        setAgreement(termsAgreement);

        if (!termsAgreement) {
          showDialog();
        }
      }
      load();
    },
    [navigation],
  );
  return (
    <>
      {!agreement && (
        <View style={styles.container}>
          <Dialog.Container visible={dialogVisible}>
            <Dialog.Title style={styles.title}>
              <Text style={styles.conditionText}>
                By using the app, you agree to the Voice Timer{" "}
                <Text
                  onPress={goToTermsScreen}
                  onPressIn={() => setIsPressed(true)}
                  onPressOut={() => setIsPressed(false)}
                  style={[
                    styles.link,
                    { color: pressed ? Colors.primaryTint40 : Colors.primary },
                  ]}
                >
                  User Agreement.
                </Text>
              </Text>
            </Dialog.Title>
            <Dialog.Button
              label='Cancel'
              onPress={hideDialog}
            />
            <Dialog.Button
              label='I agree'
              onPress={async () => {
                await setItemInStorage("termsAgreement", true);
                setDialogVisible(false);
              }}
            />
          </Dialog.Container>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    color: Colors.primary,
    borderBottomColor: Colors.primary,
    fontWeight: 600,
    fontSize: 15,
    borderBottomWidth: 1,
    textDecorationLine: "underline",
  },

  conditionText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 600,
  },
});
