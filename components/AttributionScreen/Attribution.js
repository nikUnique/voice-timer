import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import { SPACE } from "../../constants/spacing";
import { RADIUS } from "../../constants/radius";

const ATTRIBUTIONS = [
  {
    id: "0001",
    name: "Tacky Organ.wav by DirtyArchives (Creative Commons 0)",
    url: "https://freesound.org/s/440256/",
  },

  {
    id: "0002",
    name: "320655__rhodesmas__level-up-01.mp3 by shinephoenixstormcrow (Attribution 3.0)",
    url: "https://freesound.org/s/337049/",
  },
];

function AttributionRow({ item, index }) {
  const numberStyle = {
    color: Colors.primaryTint8,
    fontSize: FONT.heading,
    fontWeight: WEIGHT.bold,
    width: 24,
  };
  const openLink = () => Linking.openURL(item.url).catch(() => {});
  const number = String(index + 1).padStart(2, "0");

  return (
    <Pressable
      onPress={openLink}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={numberStyle}>{number}</Text>
      <View style={styles.rowText}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.link}>{item.url}</Text>
      </View>
    </Pressable>
  );
}

export default function Attribution() {
  const title = {
    color: Colors.primaryTint90,
    fontSize: FONT.heading,
    fontWeight: WEIGHT.bold,
    marginBottom: SPACE.xxxl,
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={title}>Built with</Text>
      <View style={styles.list}>
        {ATTRIBUTIONS.map((item, index) => (
          <AttributionRow
            key={item.id}
            item={item}
            index={index}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    paddingHorizontal: SPACE.xxxl,
    paddingTop: SPACE.xxxl,
    paddingBottom: SPACE.xxxl,
  },

  list: {
    borderTopWidth: 1,
    borderTopColor: Colors.whiteAlpha10,
    borderLeftWidth: 1,
    borderLeftColor: Colors.whiteAlpha10,
    borderRightWidth: 1,
    borderRightColor: Colors.whiteAlpha10,
    borderRadius: RADIUS.xs,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACE.xl,
    paddingHorizontal: SPACE.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha10,
    gap: SPACE.xl,
  },
  rowPressed: {
    backgroundColor: Colors.whiteAlpha10,
  },

  rowText: {
    flex: 1,
  },
  name: {
    color: Colors.primaryTint90,
    fontSize: FONT.subheading,
    fontWeight: WEIGHT.semibold,
    marginBottom: SPACE.xs,
  },
  link: {
    color: Colors.grayTint70,
    fontSize: FONT.caption,
  },
});
