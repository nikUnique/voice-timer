import React, { useState } from "react";
import { FlatList, Text, View, useWindowDimensions } from "react-native";

const TIMER_DATA = [
  { id: "1", label: "Morning Stretch", duration: "5:00" },
  { id: "2", label: "Deep Work Block", duration: "25:00" },
  { id: "3", label: "Short Break", duration: "10:00" },
  { id: "4", label: "Afternoon Focus", duration: "45:00" },
];

function TimerItem({ label, duration, itemHeight }) {
  return (
    <View
      style={{
        height: itemHeight,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1a2e",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        {label}
      </Text>
      <Text style={{ color: "#e0e0e0", fontSize: 64, fontWeight: "200" }}>
        {duration}
      </Text>
      <Text style={{ color: "#888", fontSize: 14, marginTop: 24 }}>
        Swipe to navigate
      </Text>
    </View>
  );
}

export default function TimerList() {
  const { height: windowHeight } = useWindowDimensions();
  const [listHeight, setListHeight] = useState(windowHeight);

  return (
    <FlatList
      data={TIMER_DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TimerItem
          label={item.label}
          duration={item.duration}
          itemHeight={listHeight}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
    />
  );
}
