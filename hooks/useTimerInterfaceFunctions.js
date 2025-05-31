import { useCallback, useEffect } from "react";
import { InteractionManager } from "react-native";
import RNFS from "react-native-fs";
import Typo from "typo-js";

import { useRefsData } from "../context/VoiceRecognizerContext";
import { emitter } from "../utils/EventEmitter";
import { getItemFromStorage } from "../utils/helpers";

export function useTimerInterfaceFunctions({
  isActive,
  startTimer,
  pauseTimerRef,
  isPaused,
  resumeTimerRef,
  name,
  modalIsVisible,
}) {
  const { dictionaryTypoRef } = useRefsData();

  const controlTimer = useCallback(
    async function () {
      if (!isActive) {
        await startTimer();
        return;
      }
      if (isActive && !isPaused) {
        pauseTimerRef.current();
        return;
      }

      if (isActive && isPaused) {
        resumeTimerRef.current();
      }
    },
    [isActive, isPaused, pauseTimerRef, resumeTimerRef, startTimer]
  );

  useEffect(
    function () {
      // This is needed for general buttons on the screen to have right functions to execute based on the currently viewed timer
      emitter.all.delete(`controlTimer-${name}`);
      emitter.on(`controlTimer-${name}`, controlTimer);
    },
    [controlTimer, name]
  );

  async function createDictionary(affData, dicData) {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {});
      const newDate = Date.now();
      const dictionary = new Typo("en_US", affData, dicData, {});
      dictionaryTypoRef.current = dictionary;
      console.log(Date.now() - newDate, "The gap");
      resolve(dictionary);
      if (!dictionary)
        reject(
          `An error occured in createDictionary function while creating dictionary`
        );
    });
  }

  async function loadDictionary() {
    try {
      if (dictionaryTypoRef.current) {
        return;
      }

      const affPath = `index.aff`;
      const dicPath = `index.dic`;

      let affData = await getItemFromStorage("affData");
      let dicData = await getItemFromStorage("dicData");

      if (!affData) {
        // Read files asynchronously
        affData = await RNFS.readFileAssets(affPath, "utf8");
        dicData = await RNFS.readFileAssets(dicPath, "utf8");
      }

      if (affData && dicData) {
        createDictionary(affData, dicData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function startChangeNameHandler() {
    emitter.emit("navigation", {
      screen: "ChangeTimerNameScreen",
      name,
      modalIsVisible,
      onModalIsVisible: startChangeNameHandler,
      onLoadDictionary: loadDictionary,
    });
  }

  return {
    controlTimer,
    createDictionary,
    startChangeNameHandler,
    loadDictionary,
  };
}
