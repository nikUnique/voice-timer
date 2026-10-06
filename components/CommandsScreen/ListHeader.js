import { memo } from "react";
import { View } from "react-native";

import { Text } from "../../ui/AppText";
import { styles } from "./CommandsStyles";

function ListHeader() {
  return (
    <>
      <Text style={styles.title}>Voice Commands</Text>
      <Text style={styles.subtitle}>
        Use the following voice commands to control the timer hands-free.
      </Text>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>
          Why a card says &quot;Unavailable&quot;
        </Text>
        <Text style={styles.legendText}>
          A greyed-out card ends with one reason line. It is either a setting
          you chose, which stays until you change it back, or the current state
          of the app, which clears on its own.
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.noteLabel}>While media is playing: </Text>
          &quot;pause all media&quot; and, when enabled in Settings, the skip
          commands. Everything else waits for the media to pause.
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.noteLabel}>While the timer is asleep: </Text>
          &quot;timer wake up&quot;, &quot;pause all media&quot;, &quot;play all
          media&quot;, &quot;stop finished&quot;, &quot;stop [timer name]&quot;,
          and the skip commands when enabled. Everything else waits for the wake
          command.
        </Text>
        <Text style={styles.legendText}>
          Reopen this screen to refresh these two states.
        </Text>
      </View>
    </>
  );
}

export default memo(ListHeader);
