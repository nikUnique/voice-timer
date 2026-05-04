import { ActivityIndicator, View } from "react-native";
import { Colors } from "../constants/colors";

export default function LoadingIndicator() {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
      }}
    >
      <ActivityIndicator
        size='large'
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        color={Colors.primaryTint90}
      />
    </View>
  );
}
