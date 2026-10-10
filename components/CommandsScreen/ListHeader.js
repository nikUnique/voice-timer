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
          A greyed-out card ends with one &quot;Unavailable&quot; reason line.
          It is either a setting you chose, which stays until you change it
          back, or the current state of the app, which clears on its own.
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.noteLabel}>While media is playing: </Text>
          &quot;pause all media&quot; works and, when enabled in Settings, the
          skip commands work too. Everything else waits for the media to pause.
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.noteLabel}>
            While the timer app is asleep, these commands still work:{" "}
          </Text>
          &quot;timer wake up&quot;, &quot;pause all media&quot;, &quot;play all
          media&quot;, &quot;stop finished&quot;, &quot;stop [timer name] (only
          if the timer is ringing, not just paused)&quot;, and the skip commands
          when enabled and media is playing. Everything else waits for the
          &quot;timer wake up&quot; command.
        </Text>
        <Text style={styles.legendText}>
          These two states — whether media is playing and whether the timer app
          is asleep — update live while this screen is open.
        </Text>
      </View>
    </>
  );
}

export default memo(ListHeader);
