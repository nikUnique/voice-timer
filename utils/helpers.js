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

export function getTimePhrase(date = new Date()) {
  const h = date.getHours();
  const m = date.getMinutes();

  const period =
    h < 5
      ? "at night"
      : h < 12
        ? "in the morning"
        : h < 17
          ? "in the afternoon"
          : h < 21
            ? "in the evening"
            : "at night";

  const h12 = h % 12 || 12;
  const pad = (n) => String(n).padStart(2, "0");

  // Quarter / half expressions
  if (m === 0) return `${h12} o'clock ${period}.`;
  if (m === 15) return `Quarter past ${h12} ${period}.`;
  if (m === 30) return `Half past ${h12} ${period}.`;
  if (m === 45) {
    const next = (h12 % 12) + 1;
    return `Quarter to ${next} ${period}.`;
  }
  if (m < 10) return `Just past ${h12} — ${h12}:${pad(m)} ${period}.`;
  if (m > 50) return `Almost ${(h12 % 12) + 1} ${period}.`;

  return `It's ${h12}:${pad(m)} ${period}.`;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
