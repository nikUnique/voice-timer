import { FlatList, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HistoryItem from "../components/HistoryItem";
import { Colors } from "../constants/colors";
import { useRecognizerData } from "../context/VoiceRecognizerContext";

// const history = [
//   {
//     id: "1",
//     label: "Deep work",
//     duration: 2530,
//     startTime: new Date(2026, 3, 10, 14, 30),
//   },
//   {
//     id: "2",
//     label: "Reading",
//     duration: 1500,
//     startTime: new Date(2026, 3, 10, 10, 15),
//   },
//   {
//     id: "3",
//     label: "Deep work",
//     duration: 2530,
//     startTime: new Date(2026, 3, 10, 14, 30),
//   },
//   {
//     id: "4",
//     label: "Reading",
//     duration: 1500,
//     startTime: new Date(2026, 3, 10, 10, 15),
//   },
//   {
//     id: "5",
//     label: "Deep work",
//     duration: 2530,
//     startTime: new Date(2026, 3, 10, 14, 30),
//   },
//   {
//     id: "6",
//     label: "Reading",
//     duration: 1500,
//     startTime: new Date(2026, 3, 10, 10, 15),
//   },
//   {
//     id: "7",
//     label: "Deep work",
//     duration: 2530,
//     startTime: new Date(2026, 3, 10, 14, 30),
//   },
//   {
//     id: "8",
//     label: "Reading",
//     duration: 1500,
//     startTime: new Date(2026, 3, 10, 10, 15),
//   },
//   {
//     id: "9",
//     label: "Deep work",
//     duration: 2530,
//     startTime: new Date(2026, 3, 10, 14, 30),
//   },
//   {
//     id: "10",
//     label: "Reading",
//     duration: 1500,
//     startTime: new Date(2026, 3, 10, 10, 15),
//   },
// ];

export default function HistoryScreen() {
  const { timersHistory } = useRecognizerData();

  console.log(timersHistory, "timerHistory");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <FlatList
          data={timersHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={<Text style={styles.empty}>No sessions yet</Text>}
          style={{ width: "100%" }}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: Colors.grayTint10,
    marginTop: 60,
    fontSize: 15,
  },
});
