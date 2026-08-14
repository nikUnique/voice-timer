import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundService from "react-native-background-actions";

import { NativeModules, PermissionsAndroid, Platform } from "react-native";

import { getSharedObject, updateSharedObject } from "./sharedVariables";

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

export function cleanStop() {
  updateSharedObject({ isTaskRunning: false });
  BackgroundService.stop();
  NativeModules.AudioFocusModule.releaseAudioFocus();
  console.log("BackgroundService stopped, audio focus released 🌜");
}

export const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim(); // strip punctuation

export const ensureBluetoothPermission = async () => {
  if (Platform.OS !== "android" || Platform.Version < 31) {
    return true; // not needed pre-Android 12
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    {
      title: "Bluetooth Permission",
      message: "Allow access to use your Bluetooth headset microphone",
      buttonPositive: "Allow",
      buttonNegative: "Deny",
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const formatStatusSpeech = function (
  runningTimerNames,
  pausedTimerNames,
  alertingTimerNames,
) {
  const runningTimerNamesLength = runningTimerNames.length;
  const pausedTimerNamesLength = pausedTimerNames.length;
  const alertingTimerNamesLength = alertingTimerNames.length;
  if (
    !runningTimerNamesLength &&
    !pausedTimerNamesLength &&
    !alertingTimerNamesLength
  ) {
    return "No timers active.";
  }

  const headerParts = [
    runningTimerNamesLength
      ? `${runningTimerNamesLength} timers running`
      : null,
    pausedTimerNamesLength ? `${pausedTimerNamesLength} timers paused` : null,
    alertingTimerNamesLength
      ? `${alertingTimerNamesLength} timers alerting`
      : null,
  ].filter(Boolean);

  const header = headerParts.join(", ") + ".";

  const timerLines = [
    runningTimerNamesLength && "Running timers: ",
    ...(getSharedObject().runningTimerNames.join(", ") + ". "),
    pausedTimerNamesLength && "Paused timers: ",
    ...(getSharedObject().pausedTimerNames.join(", ") + ". "),
    alertingTimerNamesLength && "Alerting timers: ",
    ...(getSharedObject().alertingTimerNames.join(", ") + ". "),
  ]
    .filter(Boolean)
    .join("");

  return `${header} ${timerLines}`;
};

export const formatRingingResetSpeech = function (timerNames) {
  if (timerNames.length === 0) return "Nothing to stop.";
  if (timerNames.length === 1) return `timer ${timerNames[0]} stopped.`;

  const last = timerNames[timerNames.length - 1];
  const rest = timerNames.slice(0, -1);
  const count = timerNames.length;
  return `${count} timers stopped. ${rest.join(", ")} and ${last}.`;
};
