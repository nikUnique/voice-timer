import { memo } from "react";
import { Text, View } from "react-native";

import { styles } from "./CommandsStyles";

function ListHeader() {
  return (
    <>
      <Text style={styles.title}>Voice Commands</Text>
      <Text style={styles.subtitle}>
        Use the following voice commands to control the timer hands-free.
      </Text>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>When a command is unavailable</Text>
        <Text style={styles.legendText}>
          <Text style={styles.noteLabel}>Off</Text> means you switched it off in
          Settings, so it stays unavailable until you turn it back on.
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.noteLabel}>Blocked</Text> means it is on, but
          something else stops it right now. Media must be stopped before any
          other command works, and a sleeping timer ignores everything except
          the wake, stop media and stop commands. These clear on their own, so
          reopen this screen to see the current state.
        </Text>
      </View>
    </>
  );
}

export default memo(ListHeader);
