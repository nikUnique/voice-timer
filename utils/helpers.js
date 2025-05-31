import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

export const sleep = async (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 1000);
  });
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = seconds >= 60 ? Math.floor(seconds / 60) % 60 : "";
  const secs = seconds % 60;
  if (seconds < 0) {
    return `00:00`;
  }
  return `${hours ? String(hours).padStart(2, "0") + ":" : ""}${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const letVarsObj = { timersLabel: "", delay: 1, appStateBox: "" };

export async function setItemInStorage(key, value) {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (error) {
    console.error("Error setting item in AsyncStorage: ", error);
  }
}

export async function getItemFromStorage(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting item from storage: ", error);
    return null;
  }
}

export async function removeItemFromStorage(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing item from AsyncStorage ", error);
  }
}

export async function openNotificationChannelSettings(channelId) {
  if (Platform.OS === "android") {
    NativeModules.NativeUtilsModule.openNotificationChannel(channelId);

    await setItemInStorage("notificationSettingsOpened", "true");
  }
}
