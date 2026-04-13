import { Linking, StyleSheet, Text } from "react-native";

export default function Attribution() {
  return (
    <>
      <Text style={{ fontSize: 16, marginBottom: 16 }}>
        This app uses the following assets:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          • &apos;Inside Out, Bundle of Joy, music box&apos; by erger562
          from&nbsp;
          <Text
            style={{ color: "blue" }}
            onPress={() => Linking.openURL("https://freesound.org/s/585736/")}
          >
            freesound.org
          </Text>
          &nbsp;– License: Creative Commons 0
        </Text>
      </Text>
    </>
  );
}

const styles = StyleSheet.create({});
