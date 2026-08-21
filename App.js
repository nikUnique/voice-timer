import { Ionicons } from "@expo/vector-icons";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Brightness from "expo-brightness";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { memo, useCallback, useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Tts from "react-native-tts";
import AgreementAlert from "./components/TimersScreen/AgreementAlert";
import AlarmOverlay from "./components/TimersScreen/AlarmOverlay";
import ContextMenu from "./components/TimersScreen/ContextMenu";
import TimerNameControl from "./components/TimersScreen/TimerNameControl";
import { Colors } from "./constants/colors";
import { FONT } from "./constants/typography";
import VoiceRecognizerProvider, {
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
import { DIM_PERCENTAGE, DIM_TIMEOUT } from "./utils/config";
import { cleanStop } from "./utils/helpers";
import { getSharedObject } from "./utils/sharedVariables";
import { useForegroundService } from "./hooks/TimersScreen/timers/useForegroundService";

const Stack = createNativeStackNavigator();

function AppWithContext() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const { dimScreenRef, keepScreenDim } = useSettingsData();

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
          style='light'
          animated
          translucent
          backgroundColor={Colors.primary}
        />
      }

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
              name='TimersScreen'
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
                        name='ellipsis-vertical'
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
              name='CreateTimerScreen'
              component={CreateTimerScreen}
              options={{
                title: "Create new timer",
              }}
            />
          }
          {
            <Stack.Screen
              name='ChangeTimerNameScreen'
              component={TimerNameControl}
              options={{
                headerShown: false,
              }}
            />
          }
          <Stack.Screen
            name='CommandsScreen'
            component={CommandsScreen}
            options={{
              title: "Commands",
            }}
          />
          <Stack.Screen
            name='SettingsScreen'
            component={SettingsScreen}
            options={{
              title: "Settings",
            }}
          />
          <Stack.Screen
            name='AboutScreen'
            component={AboutScreen}
            options={{
              title: "About",
            }}
          />
          <Stack.Screen
            name='TermsScreen'
            component={TermsScreen}
            options={{
              title: "User Agreement",
            }}
          />
          <Stack.Screen
            name='HistoryScreen'
            component={HistoryScreen}
            options={{
              title: "History",
            }}
          />
          <Stack.Screen
            name='AttributionScreen'
            component={AttributionScreen}
            options={{
              title: "Attribution",
            }}
          />
          {
            <Stack.Screen
              name='ModalScreen'
              component={AlarmOverlay}
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
              }}
            />
          }
        </Stack.Navigator>
      </NavigationContainer>
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
  },
});
