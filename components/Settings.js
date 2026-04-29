import { ScrollView, StyleSheet, View } from "react-native";

import AppBehavior from "./AppBehavior";
import Notifications from "./Notifications";
import Sound from "./Sound";
import TimerBehavior from "./TimerBehavior";
import VoiceControl from "./VoiceControl";

export default function Settings() {
  return (
    <View style={styles.settingsContainer}>
      <ScrollView style={styles.scrollView}>
        <Sound />
        <TimerBehavior />
        <VoiceControl />
        <AppBehavior />
        <Notifications />
      </ScrollView>
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
