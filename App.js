import { Ionicons } from "@expo/vector-icons";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { memo, useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import AgreementAlert from "./components/AgreementAlert";
import AlarmOverlay from "./components/AlarmOverlay";
import ContextMenu from "./components/ContextMenu";
import TimerNameControl from "./components/TimerNameControl";
import { Colors } from "./constants/colors";
import VoiceRecognizerProvider from "./context/VoiceRecognizerContext";
import AboutScreen from "./screens/AboutScreen";
import CommandsScreen from "./screens/CommandsScreen";
import CreateTimerScreen from "./screens/CreateTimerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TermsScreen from "./screens/TermsScreen";
import TimersScreen from "./screens/TimersScreen";

const Stack = createNativeStackNavigator();

export default memo(function App() {
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(function () {
    checkNotificationPermission();
  }, []);

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
    <>
      {
        <StatusBar
          style='light'
          animated
          translucent
          backgroundColor={Colors.primary}
        />
      }
      <VoiceRecognizerProvider>
        {/* {<Button title='Super' onPress={handleToggleModal} />} */}
        <NavigationContainer>
          <ContextMenu
            modalIsVisible={modalIsVisible}
            onToggleModal={handleToggleModal}
          />
          <AgreementAlert />

          {}

          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.primary,
                // backgroundColor: "green",
                // height: 150,
              },
              contentStyle: {
                backgroundColor: Colors.primary,
              },
              headerTitleStyle: {
                color: Colors.primaryTint90,
              },
              headerTintColor: Colors.primaryTint90,
              animation: "fade",
            }}
          >
            <Stack.Screen
              name='TimersScreen'
              component={TimersScreen}
              options={{
                title: "Timer",
                headerRight: () => {
                  return (
                    // <IconButton
                    //   icon='ellipsis-vertical'
                    //   color={Colors.primaryTint90}
                    //   size={24}
                    //   onPress={handleToggleModal}
                    // />

                    <TouchableOpacity
                      onPressOut={handleToggleModal}
                      style={
                        (({ pressed }) => pressed && styles.pressed,
                        styles.pressable)
                      }
                    >
                      {/* <View> */}
                      <Ionicons
                        name='ellipsis-vertical'
                        color={Colors.primaryTint90}
                        size={24}
                      />
                      {/* </View> */}
                    </TouchableOpacity>
                  );
                },
              }}
            />
            <Stack.Screen
              name='CreateTimerScreen'
              component={CreateTimerScreen}
              options={{
                title: "Create new timer",
              }}
            />
            <Stack.Screen
              name='ChangeTimerNameScreen'
              component={TimerNameControl}
              options={{
                // title: "Create new timer",
                // presentation: "modal",
                headerShown: false,
              }}
            />
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
              name='ModalScreen'
              component={AlarmOverlay}
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </VoiceRecognizerProvider>
    </>
  );
});

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 80,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: 150,
    elevation: 5,
    padding: 10,
  },
  menuItem: {
    padding: 10,
    fontSize: 16,
    // textAlign: "center",
  },

  wrapper: {
    zIndex: 1000,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
