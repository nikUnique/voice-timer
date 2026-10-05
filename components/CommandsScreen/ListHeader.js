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
          A command is unavailable either because you switched it off in
          Settings, which stays until you turn it back on, or because of what
          the app is doing right now, which clears on its own. While media is
          playing, only &quot;pause all media&quot; still works. While the timer is
          asleep, the media commands, stop finished, stop and the wake command
          still work. Reopen this screen to see the current state.
        </Text>
      </View>
    </>
  );
}

export default memo(ListHeader);
