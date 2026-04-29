import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Brightness from "expo-brightness";
import notifee from "@notifee/react-native";
import { Ionicons } from "@expo/vector-icons";

import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import VoiceRecognizerProvider, {
  useSettingsData,
} from "./context/VoiceRecognizerContext";
import { NavigationContainer } from "@react-navigation/native";
import { AuthorizationStatus } from "@notifee/react-native";
import { Colors } from "./constants/colors";
import AgreementAlert from "./components/AgreementAlert";
import AlarmOverlay from "./components/AlarmOverlay";
import ContextMenu from "./components/ContextMenu";
import TimerNameControl from "./components/TimerNameControl";
import { useAppState } from "./hooks/useAppState";
import AboutScreen from "./screens/AboutScreen";
import CommandsScreen from "./screens/CommandsScreen";
import CreateTimerScreen from "./screens/CreateTimerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TermsScreen from "./screens/TermsScreen";
import TimersScreen from "./screens/TimersScreen";
import { DIM_PERCENTAGE, DIM_TIMEOUT } from "./utils/config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useResponsive } from "./hooks/useResponsive";

const Stack = createNativeStackNavigator();

function AppWithContext() {
  // return (
  //   <View
  //     style={{
  //       alignItems: "center",
  //       justifyContent: "center",
  //       display: "flex",
  //       height: "100%",
  //     }}
  //   >
  //     <Text style={{ fontSize: 20 }}>Hello, Android 7</Text>
  //   </View>
  // );

  const [modalIsVisible, setModalIsVisible] = useState(false);
  const { dimScreenRef } = useSettingsData();
  const { appState } = useAppState();

  const restoreBrightness = useCallback(
    function () {
      Brightness.restoreSystemBrightnessAsync();

      clearTimeout(dimScreenRef.current);
      dimScreenRef.current = setTimeout(function () {
        Brightness.setBrightnessAsync(DIM_PERCENTAGE);
      }, DIM_TIMEOUT * 1000);
    },
    [dimScreenRef],
  );

  useEffect(
    function () {
      checkNotificationPermission();
      restoreBrightness();
    },
    [appState, restoreBrightness],
  );

  async function checkNotificationPermission() {
    if (Platform.OS === "android") {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        return;
      }

      setTimeout(async function () {
        await notifee.requestPermission();
      }, 1000);
    }
  }

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

              fontSize: 18,
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
