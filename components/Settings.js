import { ScrollView, StyleSheet, View } from "react-native";

import AppBehavior from "./AppBehavior";
import Notifications from "./Notifications";
import Sound from "./Sound";
import TimerBehavior from "./TimerBehavior";
import VoiceControl from "./VoiceControl";
import { useReady } from "../hooks/useReady";
import LoadingIndicator from "../ui/LoadingIndicator";

export default function Settings() {
  const ready = useReady();
  return (
    <View style={styles.settingsContainer}>
      {ready ? (
        <ScrollView style={styles.scrollView}>
          <Sound />
          <TimerBehavior />
          <VoiceControl />
          <AppBehavior />
          <Notifications />
        </ScrollView>
      ) : (
        <LoadingIndicator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
    marginBottom: 32,
  },

  settingsContainer: {
    padding: 4,
  },
});
