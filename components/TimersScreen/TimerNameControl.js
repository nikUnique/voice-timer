import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Colors } from "../../constants/colors";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { useDictionary } from "../../hooks/shared/useDictionary";
import { emitter } from "../../utils/EventEmitter";
import { setItemInStorage } from "../../utils/helpers";
import {
  getSharedObject,
  updateSharedObject,
} from "../../utils/sharedVariables";
import { SPACE } from "../../constants/spacing";
import { RADIUS } from "../../constants/radius";
import { WEIGHT } from "../../constants/weight";

export default function TimerNameControl() {
  const { name } = getSharedObject().changeTimerNameParams;

  const [timerName, setTimerName] = useState(name);
  const [isCorrect, setIsCorrect] = useState(true);
  const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false);

  const inputRef = useRef(null);

  const { timers, dictionaryTypoRef, setTimers } = useRefsData();
  const { setVoiceEnabled, voiceEnabled } = useSettingsData();
  const { loadDictionary } = useDictionary();

  // Loaded only to warn, never to block. It is read off screen so the rename
  // dialog opens instantly.
  useEffect(
    function () {
      let isActive = true;

      loadDictionary().finally(() => {
        if (isActive) setIsDictionaryLoaded(true);
      });

      return function () {
        isActive = false;
      };
    },
    [loadDictionary],
  );

  // Vosk only knows the words in its acoustic model, and an unusual word is
  // matched against the nearest phrase it does know, which can start the wrong
  // timer. The dictionary is only a rough proxy for that vocabulary, so this
  // is a hint and not a restriction.
  const unrecognizableWords = useMemo(() => {
    const dictionary = dictionaryTypoRef.current;

    if (!isDictionaryLoaded || !dictionary || !timerName.trim()) return [];

    return timerName
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0 && !dictionary.check(word));
  }, [dictionaryTypoRef, isDictionaryLoaded, timerName]);

  async function changeTimerName() {
    try {
      const lowerCaseName = (
        timerName[0].trim() + timerName.slice(1).toLowerCase().trim()
      )
        .replace(/\s+/g, " ")
        .trim();

      // The Vosk grammar is built straight from the stored timer names, so any
      // name the user can pronounce works. These rules only keep names
      // recognisable: 1-2 words, letters only, at least 3 characters.
      const wordCount = lowerCaseName.split(" ").length;
      const areOnlyLetters = /^[A-Za-z]+( [A-Za-z]+)?$/.test(lowerCaseName);

      if (wordCount > 2 || !areOnlyLetters || lowerCaseName.length < 3) {
        console.log(
          `The timer name "${lowerCaseName}" should be 1-2 words of letters only, at least 3 characters`,
        );
        setIsCorrect(false);
        return;
      }

      const timerWithSameName = timers.find(
        (timer) =>
          timer.name.trim().toLowerCase() ===
          lowerCaseName.trim().toLowerCase(),
      );
      if (timerWithSameName && timerWithSameName.name !== name) {
        console.log("Timer with this name already exists, try another name ⛹️‍♂️");
        return timers;
      }

      setIsCorrect(true);
      setTimerName(lowerCaseName);
      updateSharedObject({ name: lowerCaseName });

      // Restart vosk
      if (voiceEnabled) {
        setVoiceEnabled(false);
        setTimeout(function () {
          setVoiceEnabled(true);
        }, 100);
      }

      const allListeners = [...emitter.all].filter((listener) =>
        listener[0].includes(name),
      );
      allListeners.forEach((listener) => {
        emitter.all.delete(`${listener[0]}`);
      });

      const newTimersArr = timers.map((timer) =>
        timer.name === name ? { ...timer, name: lowerCaseName } : timer,
      );

      setTimers(newTimersArr);
      setItemInStorage("timers", newTimersArr);

      emitter.emit("goBack");
    } catch (error) {
      console.error(`An error occurred in the changeTimerName handler`, error);
    }
  }

  function cancelUpdate() {
    setTimerName(name);
    setIsCorrect(true);
    emitter.emit("goBack");
  }

  const includesName = timers.find(
    (timer) =>
      timer.name?.trim().toLowerCase() !== name?.trim?.().toLowerCase() &&
      timer.name?.trim().toLowerCase() === timerName?.trim().toLowerCase(),
  );

  const textInputsStyle = {
    borderColor: isCorrect ? Colors.primaryTint40 : "red",
  };

  return (
    <View style={styles.outerModalBox}>
      <View>
        <View style={styles.innerModalBox}>
          <View style={styles.insideModal}>
            <View style={styles.textInputContainer}>
              <View style={styles.textBox}>
                {!isCorrect && (
                  <Text style={styles.errorText}>
                    Use 1-2 words of english letters only, at least 3 characters
                  </Text>
                )}
              </View>
              {includesName && (
                <Text style={styles.errorText}>
                  Timer with this name already exists
                </Text>
              )}
              {unrecognizableWords.length > 0 && (
                <Text style={styles.warningText}>
                  {unrecognizableWords.length > 1
                    ? `${unrecognizableWords.join(
                        ", ",
                      )} may be hard for voice recognition`
                    : `${unrecognizableWords[0]} may be hard for voice recognition`}
                  . You can still save it, or try a more common word.
                </Text>
              )}

              <TextInput
                value={timerName}
                onChangeText={setTimerName}
                ref={inputRef}
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
                <View style={styles.modalButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </Pressable>
              <Pressable onPress={changeTimerName}>
                <View style={styles.modalButton}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
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
    padding: SPACE.md,
    marginHorizontal: SPACE.md,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: RADIUS.chip,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: Colors.primaryTint90,
    fontWeight: WEIGHT.semibold,
  },

  textBox: {
    transform: `translateX(0) translateY(-40%)`,
    position: "absolute",
    bottom: SPACE.xxl,
  },

  errorText: {
    color: Colors.primaryTint90,
  },

  warningText: {
    color: Colors.pausedColor,
  },

  textInputContainer: {
    justifyContent: "center",
  },

  textInput: {
    borderWidth: 1,
    borderColor: Colors.primaryTint90,
    padding: SPACE.lg,
    marginVertical: SPACE.lg,
    borderRadius: RADIUS.chip,
    color: Colors.primaryTint90,
  },
});
