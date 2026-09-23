import { memo } from "react";
import { Text } from "react-native";

import { styles } from "./CommandsStyles";

function ListHeader() {
  return (
    <>
      <Text style={styles.title}>Voice Commands</Text>
      <Text style={styles.subtitle}>
        Use the following voice commands to control the timer hands-free.
      </Text>
    </>
  );
}

export default memo(ListHeader);
