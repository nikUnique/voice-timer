import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import toWords from "number-to-words/src/toWords";
import SimpleKeypad from "react-native-simple-keypad";
import wordsToNumbers from "words-to-numbers";

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import {
  useRecognizerData,
  useRefsData,
} from "../context/VoiceRecognizerContext";
import IconButton from "../ui/IconButton";
import { setItemInStorage } from "../utils/helpers";
import { updateSharedObject } from "../utils/sharedVariables";

function CreateTimer() {
  const { timers, setTimers } = useRecognizerData();
  const { freshlyCreatedTimerRef, lastTimerStartedRef, workingTimersRef } =
    useRefsData();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState("------");

  function handleDelete() {
    if (inputValue[5] !== "-") {
      setInputValue((prev) => "-" + prev.slice(0, -1));
      return;
    }

    if (inputValue[4] !== "-") {
      setInputValue((prev) => prev.slice(0, 1) + "-" + prev.slice(0, -1));
      return;
    }

    if (inputValue[3] !== "-") {
      setInputValue((prev) => prev.slice(0, 2) + "-" + prev.slice(0, -1));
      return;
    }

    if (inputValue[2] !== "-") {
      setInputValue((prev) => prev.slice(0, 3) + "-" + prev.slice(0, -1));
      return;
    }

    if (inputValue[1] !== "-") {
      setInputValue((prev) => prev.slice(0, 4) + "-" + prev.slice(0, -1));
      return;
    }

    if (inputValue[0] !== "-") {
      setInputValue((prev) => prev.slice(0, 5) + prev.slice(0, -1) + "-");
      return;
    }
  }

  function handleKeyPress(value) {
    if (value === "delete") {
      handleDelete();
      return;
    }

    if (inputValue[5] === "-") {
      setInputValue((prev) => prev.slice(0, 5) + value);
      return;
    }

    if (inputValue[4] === "-") {
      setInputValue((prev) => prev.slice(0, 4) + prev.slice(-1) + value);
      return;
    }

    if (inputValue[3] === "-") {
      setInputValue((prev) => prev.slice(0, 3) + prev.slice(-2) + value);
      return;
    }

    if (inputValue[2] === "-") {
      setInputValue((prev) => prev.slice(0, 2) + prev.slice(-3) + value);
      return;
    }

    if (inputValue[1] === "-") {
      setInputValue((prev) => prev.slice(0, 1) + prev.slice(-4) + value);
      return;
    }

    if (inputValue[0] === "-") {
      setInputValue((prev) => prev.slice(-5) + value);
      return;
    }
  }

  const improvedInputValue = inputValue
    .split("")
    .map((letter) => (letter === "-" ? "0" : letter))
    .join("");

  async function onCreateTimer() {
    try {
      lastTimerStartedRef.current = Date.now();

      const hours = +improvedInputValue.slice(0, 2);
      const minutes = +improvedInputValue.slice(2, 4);
      const seconds = +improvedInputValue.slice(4);

      const finalTime = hours * 3600 + minutes * 60 + seconds;

      if (finalTime <= 0) {
        console.log(`Timer should have at least 1 second of time`);
        return;
      }

      const startsWithNumberTimers = timers.filter(
        (timer) => typeof wordsToNumbers(timer.name.toLowerCase()) === "number",
      );

      const allTimerNumbers = startsWithNumberTimers.map((timer) => {
        return wordsToNumbers(timer.name.trim());
      });

      const anotherNextNumber = allTimerNumbers.reduce((acc, _, i, arr) => {
        return arr.includes(acc) ? ++acc : acc;
      }, 1);

      const nextAvailableNumber =
        anotherNextNumber !== undefined && anotherNextNumber;

      let newName = nextAvailableNumber
        ? `${toWords(nextAvailableNumber).slice(0, 1).toUpperCase() + toWords(nextAvailableNumber).slice(1)}`
        : `${toWords(1).slice(0, 1) + toWords(1).slice(1)}`;

      newName = newName.includes("-") ? newName.replace("-", " ") : newName;

      const newTimer = {
        name: newName,
        time: finalTime,
        createdAt: Date.now(),
        id: Math.random().toString(),
      };

      const newTimerArray = [...timers, newTimer];

      const sortedTimers = newTimerArray.slice();

      workingTimersRef.current.length < 5 &&
        updateSharedObject({ name: newName });

      setItemInStorage("timers", sortedTimers);
      setTimers(sortedTimers);
      freshlyCreatedTimerRef.current = newTimer;

      if (sortedTimers.length === 1) {
        navigation.replace("TimersScreen");
      }
      if (sortedTimers.length > 1) {
        navigation.goBack();
      }
    } catch (error) {
      console.error(`An error occured in the onCreateTimer function`, error);
    }
  }

  return (
    <>
      {
        <View style={styles.container}>
          <View style={styles.inputValueContainer}>
            <Text style={styles.inputValue}>
              {String(improvedInputValue.slice(0, 2)).padStart(2, "0")}
              <Text style={styles.unit}>h</Text>{" "}
              {String(improvedInputValue.slice(2, 4)).padStart(2, "0")}
              <Text style={styles.unit}>m</Text>{" "}
              {String(improvedInputValue.slice(4, 6)).padStart(2, "0")}
              <Text style={styles.unit}>s</Text>{" "}
            </Text>
          </View>

          <View style={styles.keypadContainer}>
            <SimpleKeypad
              onKeyPress={handleKeyPress}
              textStyle={styles.buttonStyle}
              backspaceIcon={
                <Ionicons
                  name='backspace'
                  color={Colors.primaryTint90}
                  size={30}
                  style={styles.buttonStyle}
                />
              }
            />
          </View>
          <View style={styles.iconContainer}>
            <IconButton
              icon='play'
              color={Colors.primaryTint90}
              onPress={onCreateTimer}
              size={30}
              style={styles.icon}
            />
          </View>
        </View>
      }
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: -1,
    justifyContent: "center",
    width: "80%",
  },

  keypadContainer: {
    flex: 3,
  },

  iconContainer: {
    bottom: 64,
    alignItems: "center",
  },

  icon: {
    padding: 28,
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: "50%",
  },

  buttonStyle: {
    fontWeight: "600",
    fontSize: 44,
    color: Colors.primaryTint90,
    backgroundColor: Colors.whiteAlpha20,
    width: 85,
    height: 85,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 45,
    marginBottom: 10,
  },

  inputValueContainer: {
    flex: 1,
    justifyContent: "center",
  },

  inputValue: {
    color: Colors.primaryTint90,
    fontSize: 44,
    alignSelf: "center",
  },

  unit: {
    fontSize: 18,
  },
});

export default CreateTimer;
