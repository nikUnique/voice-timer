import { memo, useEffect, useCallback, useState } from "react";
import { FlatList, View } from "react-native";

import { useSettingsData } from "../../context/VoiceRecognizerContext";
import LoadingIndicator from "../../ui/LoadingIndicator";
import CommandCard from "./CommandCard";
import { styles } from "./CommandsStyles";
import ListHeader from "./ListHeader";
import { useCommandsList } from "./useCommandsList";
import VoiceDisabledEmptyState from "./VoiceDisabledEmptyState";

export default memo(function Commands() {
  const [ready, setReady] = useState(false);
  const { voiceEnabled } = useSettingsData();
  const commands = useCommandsList();

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const renderItem = useCallback(({ item }) => <CommandCard item={item} />, []);

  if (!ready) {
    return <LoadingIndicator />;
  }

  if (!voiceEnabled) {
    return <VoiceDisabledEmptyState />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={commands}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.badge}-${index}`}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
      />
    </View>
  );
});
