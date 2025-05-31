import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { setItemInStorage } from "../utils/helpers";
import { Colors } from "../constants/colors";
import { emitter } from "../utils/EventEmitter";
import { getSharedObject } from "../utils/sharedVariables";

export default function TimerNameControl() {
  const { name, modalIsVisible, onModalIsVisible, onLoadDictionary } =
    getSharedObject().changeTimerNameParams;
  const [timerName, setTimerName] = useState(name);
  const [isCorrect, setIsCorrect] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const inputRef = useRef(null);

  const { timers, dictionaryTypoRef, setTimers } = useRefsData();

  console.log(
    "chaps",
    name,
    modalIsVisible,
    onModalIsVisible,
    onLoadDictionary
  );

  async function changeTimerName() {
    try {
      if (!isTapped) {
        console.log("Closing the modal in the beginning of changeTimerName");

        onModalIsVisible();
        return;
      }

      if (!isReady) {
        console.log(`Please wait a second, the dictionary is loading... ⌛`);

        return;
      }

      const lowerCaseName = (
        timerName[0].trim() + timerName.slice(1).toLowerCase().trim()
      )
        .replace(/\s+/g, " ")
        .trim();

      const firstWord = lowerCaseName.split(" ")[0];
      const secondWord = lowerCaseName.split(" ")[1];

      const isFirstWordCorrect = dictionaryTypoRef.current.check(firstWord);
      const isSecondWordCorrect = secondWord
        ? dictionaryTypoRef.current.check(secondWord)
        : true;

      const areBothWordsCorrect = isFirstWordCorrect && isSecondWordCorrect;
      // console.log("areBothWordsCorrect", areBothWordsCorrect);

      if (!areBothWordsCorrect || lowerCaseName.split(" ").length > 2) {
        console.log(
          "Please check your spelling and try again.",
          lowerCaseName.split(" ").length
        );
        setIsCorrect(false);
        return;
      }

      if (lowerCaseName.length < 3) {
        console.log("The timer name should contains at least 3 characters");
        return;
      }

      const areOnlyLetters = /^[A-Za-z0-9]+( [A-Za-z0-9]+)?$/.test(
        lowerCaseName
      );

      if (!areOnlyLetters) {
        console.log(
          `The timerName ${lowerCaseName} contains other characters except letters, but only letters are allowed, please change your timer name to follow this rule 🚅`
        );
        return;
      }

      const timerWithSameName = timers.find(
        (timer) =>
          timer.name.trim().toLowerCase() === lowerCaseName.trim().toLowerCase()
      );
      if (timerWithSameName && timerWithSameName.name !== name) {
        console.log("Timer with this name already exists, try another name ⛹️‍♂️");
        return timers;
      }

      setIsCorrect(true);
      setTimerName(lowerCaseName);

      const allListeners = [...emitter.all].filter((listener) =>
        listener[0].includes(name)
      );
      allListeners.forEach((listener) => {
        emitter.all.delete(`${listener[0]}`);
      });

      const newTimersArr = timers.map((timer) =>
        timer.name === name ? { ...timer, name: lowerCaseName } : timer
      );

      setTimers(newTimersArr);
      /* await */ setItemInStorage("timers", newTimersArr);

      // onModalIsVisible();
      emitter.emit("goBack");
    } catch (error) {
      console.error(`An error occured in the changeTimerName handler`, error);
    }
  }

  function cancelUpdate() {
    if (!isReady && isTapped) return;
    setTimerName(name);
    setIsCorrect(true);
    // onModalIsVisible();
    emitter.emit("goBack");
  }

  const includesName = timers.find(
    (timer) =>
      timer.name?.trim().toLowerCase() !== name?.trim?.().toLowerCase() &&
      timer.name?.trim().toLowerCase() === timerName?.trim().toLowerCase()
  );

  const textInputsStyle = {
    borderColor: isCorrect ? Colors.primaryTint40 : "red",
  };

  return (
    <View style={styles.outerModalBox}>
      {/* <Modal visible={modalIsVisible} animationType='slide' transparent> */}
      <View>
        <View style={styles.innerModalBox}>
          <View style={styles.insideModal}>
            <View style={styles.textInputContainer}>
              <View style={styles.textBox}>
                {!isCorrect && (
                  <Text style={styles.errorText}>
                    Enter 1-2 correctly spelled words using only english
                    letters, 3 letters least
                  </Text>
                )}
              </View>
              {includesName && (
                <Text style={styles.errorText}>
                  Timer with this name already exists
                </Text>
              )}

              <TextInput
                value={timerName}
                onChangeText={setTimerName}
                ref={inputRef}
                onFocus={async () => {
                  setIsTapped(true);

                  setTimeout(async () => {
                    await onLoadDictionary();
                    setIsReady(true);
                  }, 2000);
                }}
                placeholder={`Enter timer name`}
                placeholderTextColor={Colors.primaryTint90}
                cursorColor={Colors.primaryTint90}
                maxLength={20}
                style={[styles.textInput, textInputsStyle]}
                inputMode='text'
                autoCorrect={true}
                keyboardType='default'
                spellCheck={true}
              />
            </View>
            <View style={styles.modalButtonsContainer}>
              <Pressable onPress={cancelUpdate}>
                <View
                  style={[
                    styles.modalButton,
                    !isReady && isTapped && styles.forbiddenModalButton,
                  ]}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </Pressable>
              <Pressable onPress={changeTimerName}>
                <View
                  style={[
                    styles.modalButton,
                    !isReady && isTapped && styles.forbiddenModalButton,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {!isReady && isTapped ? "Loading..." : "Confirm"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      {/* </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  outerModalBox: {
    flex: 1,
    justifyContent: "center",
  },

  innerModalBox: {
    backgroundColor: Colors.primary,
  },

  insideModal: {
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
  },

  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  modalButton: {
    padding: 8,
    marginHorizontal: 8,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  forbiddenModalButton: {
    backgroundColor: Colors.whiteAlpha10,
    pointerEvents: "none",
  },

  buttonText: {
    color: Colors.primaryTint90,
    fontWeight: "600",
  },

  textBox: {
    transform: `translateX(0) translateY(-40%)`,
    position: "absolute",
  },

  errorText: {
    color: Colors.primaryTint90,
  },

  textInputContainer: {
    justifyContent: "center",
  },

  textInput: {
    borderWidth: 1,
    borderColor: Colors.primaryTint90,
    padding: 12,
    marginVertical: 12,
    borderRadius: 8,
    color: Colors.primaryTint90,
  },
});
