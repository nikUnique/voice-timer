import { ScrollView, StyleSheet, View } from "react-native";

import AppBehavior from "./AppBehavior";
import Notifications from "./Notifications";
import Sound from "./Sound";
import TimerBehavior from "./TimerBehavior";
import VoiceControl from "./VoiceControl";
import { useReady } from "../hooks/useReady";
import LoadingIndicator from "../ui/LoadingIndicator";
import { SPACE } from "../constants/spacing";

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
    padding: SPACE.xl,
    marginBottom: SPACE.xxxl,
  },

  settingsContainer: {
    padding: SPACE.sm,
  },
});
