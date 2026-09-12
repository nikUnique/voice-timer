import { InteractionManager } from "react-native";
import { useRefsData } from "../../context/VoiceRecognizerContext";
import Typo from "typo-js";
import RNFS from "react-native-fs";
import { getItemFromStorage } from "../../utils/helpers";

export function useDictionary() {
  const { dictionaryTypoRef } = useRefsData();
  async function createDictionary(affData, dicData) {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {});
      const dictionary = new Typo("en_US", affData, dicData, {});
      dictionaryTypoRef.current = dictionary;
      resolve(dictionary);
      if (!dictionary)
        reject(
          `An error occurred in createDictionary function while creating dictionary`,
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

  return { loadDictionary };
}
