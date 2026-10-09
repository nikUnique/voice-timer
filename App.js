import { Ionicons } from "@expo/vector-icons";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Brightness from "expo-brightness";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import Tts from "react-native-tts";
import AgreementAlert from "./components/TimersScreen/AgreementAlert";
import BootOverlay from "./components/BootOverlay";
import AlarmOverlay from "./components/TimersScreen/AlarmOverlay";
import ContextMenu from "./components/TimersScreen/ContextMenu";
import TimerNameControl from "./components/TimersScreen/TimerNameControl";
import { Colors } from "./constants/colors";
import { FONT } from "./constants/typography";
import VoiceRecognizerProvider, {
  useContactsData,
  useSettingsData,
} from "./context/VoiceRecognizerContext";
import { useAppStateChange } from "./hooks/shared/useAppStateChange";
import AboutScreen from "./screens/AboutScreen";
import AttributionScreen from "./screens/AttributionScreen";
import CommandsScreen from "./screens/CommandsScreen";
import CreateTimerScreen from "./screens/CreateTimerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TermsScreen from "./screens/TermsScreen";
import TimersScreen from "./screens/TimersScreen";
import {
  BOOT_MIN_MS,
  BOOT_SAFETY_MS,
  DIM_PERCENTAGE,
  DIM_TIMEOUT,
} from "./utils/config";
import { emitter } from "./utils/EventEmitter";
import { cleanStop, getItemFromStorage } from "./utils/helpers";
import { getSharedObject } from "./utils/sharedVariables";
import { useForegroundService } from "./hooks/TimersScreen/timers/useForegroundService";
import ContactsScreen from "./screens/ContactsScreen";
import LogsScreen from "./screens/LogsScreen";

const Stack = createNativeStackNavigator();

function AppWithContext() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [bootVisible, setBootVisible] = useState(true);
  const [bootGone, setBootGone] = useState(false);
  const bootDismissedRef = useRef(false);
  const bootStartedAtRef = useRef(null);
  const { dimScreenRef, keepScreenDim } = useSettingsData();
  const { setContacts } = useContactsData();

  const dismissBoot = useCallback(function dismissBoot() {
    if (bootDismissedRef.current) return;
    bootDismissedRef.current = true;

    // Keep the branded moment on screen for a beat even when boot is fast.
    const startedAt = bootStartedAtRef.current ?? Date.now();
    const remaining = Math.max(0, BOOT_MIN_MS - (Date.now() - startedAt));
    setTimeout(function () {
      setBootVisible(false);
    }, remaining);
  }, []);

  const handleBootHidden = useCallback(function () {
    setBootGone(true);
  }, []);

  useEffect(
    function () {
      // Impure calls belong in effects, not render — this is the mount clock
      // the min-display guard measures from.
      bootStartedAtRef.current = Date.now();

      // The ready signal may have fired before this effect subscribed (child
      // effects run first), so check the sticky flag instead of missing it.
      if (getSharedObject().appReady) {
        dismissBoot();
      } else {
        emitter.on("appReady", dismissBoot);
      }

      // Never let a failed boot path leave the overlay covering the app.
      const safetyTimer = setTimeout(dismissBoot, BOOT_SAFETY_MS);

      return () => {
        emitter.off("appReady", dismissBoot);
        clearTimeout(safetyTimer);
      };
    },
    [dismissBoot],
  );

  useEffect(function () {
    return () => {
      if (
        !getSharedObject().runningTimerNames.length &&
        !getSharedObject().alertingTimerNames.length
      ) {
        cleanStop();
      }
    };
  }, []);

  useEffect(
    function () {
      if (keepScreenDim) {
        Brightness.setBrightnessAsync(0);
      }
    },
    [keepScreenDim],
  );
  useEffect(() => {
    return () => {
      Tts.stop();
    };
  }, []);

  useEffect(function () {
    async function load() {
      try {
        const contacts = await getItemFromStorage("contacts");

        if (contacts) {
          setContacts(contacts);
        }
      } catch (error) {
        console.error(
          `An error occurred in the loading of Contacts from async storage`,
          error,
        );
      }
    }
    load();
  }, []);

  const restoreBrightness = useCallback(
    async function () {
      if (keepScreenDim) return;
      Brightness.restoreSystemBrightnessAsync();

      clearTimeout(dimScreenRef.current);
      dimScreenRef.current = setTimeout(async function () {
        Brightness.setBrightnessAsync(DIM_PERCENTAGE);
      }, DIM_TIMEOUT * 1000);
    },
    [dimScreenRef, keepScreenDim],
  );

  const checkNotificationPermission = useCallback(async () => {
    if (Platform.OS === "android") {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        return;
      }

      setTimeout(async function () {
        await notifee.requestPermission();
      }, 1000);
    }
  }, []);

  const checkOnForeground = useCallback(
    (nextAppState) => {
      if (nextAppState === "active") {
        checkNotificationPermission();
        restoreBrightness();
      }
    },
    [checkNotificationPermission, restoreBrightness],
  );

  useAppStateChange(checkOnForeground);

  function handleToggleModal() {
    setModalIsVisible(!modalIsVisible);
  }
  return (
    <GestureHandlerRootView
      style={styles.container}
      onStartShouldSetResponderCapture={() => {
        restoreBrightness();
      }}
    >
      {
        <StatusBar
          style="light"
          animated
          translucent
          backgroundColor={Colors.primary}
        />
      }

      <View style={[styles.appShell, bootVisible && styles.appHidden]}>
        <NavigationContainer>
          <ContextMenu
            modalIsVisible={modalIsVisible}
            onToggleModal={handleToggleModal}
          />
          <AgreementAlert />

          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.primary,
              },
              contentStyle: {
                backgroundColor: Colors.primary,
              },
              headerTitleStyle: {
                color: Colors.primaryTint90,

                fontSize: FONT.heading,
              },
              headerTintColor: Colors.primaryTint90,
              animation: "fade",
            }}
          >
            {
              <Stack.Screen
                name="TimersScreen"
                component={TimersScreen}
                options={{
                  title: "Timer",

                  headerRight: () => {
                    return (
                      <TouchableOpacity
                        onPressOut={handleToggleModal}
                        style={
                          (({ pressed }) => pressed && styles.pressed,
                          styles.pressable)
                        }
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          color={Colors.primaryTint90}
                          size={24}
                        />
                      </TouchableOpacity>
                    );
                  },
                }}
              />
            }
            {
              <Stack.Screen
                name="CreateTimerScreen"
                component={CreateTimerScreen}
                options={{
                  title: "Create new timer",
                }}
              />
            }
            {
              <Stack.Screen
                name="ChangeTimerNameScreen"
                component={TimerNameControl}
                options={{
                  headerShown: false,
                }}
              />
            }
            <Stack.Screen
              name="CommandsScreen"
              component={CommandsScreen}
              options={{
                title: "Commands",
              }}
            />
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{
                title: "Settings",
              }}
            />
            <Stack.Screen
              name="AboutScreen"
              component={AboutScreen}
              options={{
                title: "About",
              }}
            />
            <Stack.Screen
              name="TermsScreen"
              component={TermsScreen}
              options={{
                title: "User Agreement",
              }}
            />
            <Stack.Screen
              name="HistoryScreen"
              component={HistoryScreen}
              options={{
                title: "History",
              }}
            />
            <Stack.Screen
              name="AttributionScreen"
              component={AttributionScreen}
              options={{
                title: "Attribution",
              }}
            />
            <Stack.Screen
              name="ContactsScreen"
              component={ContactsScreen}
              options={{
                title: "Contacts",
              }}
            />
            <Stack.Screen
              name="LogsScreen"
              component={LogsScreen}
              options={{
                title: "Logs",
              }}
            />
            {
              <Stack.Screen
                name="ModalScreen"
                component={AlarmOverlay}
                options={{
                  presentation: "fullScreenModal",
                  headerShown: false,
                }}
              />
            }
          </Stack.Navigator>
        </NavigationContainer>
      </View>
      {!bootGone && (
        <BootOverlay visible={bootVisible} onHidden={handleBootHidden} />
      )}
    </GestureHandlerRootView>
  );
}

export default memo(function App() {
  useForegroundService();

  return (
    <>
      <VoiceRecognizerProvider>
        <AppWithContext />
      </VoiceRecognizerProvider>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Shows through the translucent status bar (and behind the transparent
    // app layer) during boot, so the strip above never flashes window white.
    backgroundColor: Colors.primary,
  },
  // App is fully laid out but invisible while the boot overlay is up —
  // opacity keeps measurement (listHeight, onLayout) working, unlike
  // display: none, so the reveal has nothing left to pop.
  appShell: {
    flex: 1,
  },
  appHidden: {
    opacity: 0,
  },
});
