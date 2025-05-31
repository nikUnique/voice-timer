import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";

export default function About() {
  function openLink() {
    Linking.openURL("https://www.hotpot.ai/art-generator").catch((err) =>
      console.error("Failed to open URL: ", err)
    );
  }

  return (
    <ScrollView
      style={{
        paddingHorizontal: 16,
        marginBottom: 32,
        marginTop: 16,
      }}
    >
      <Text style={styles.title}>About</Text>
      <Text style={styles.subtitle}>
        <Text style={{ fontWeight: "bold" }}>Voice Timer</Text> – v1.0.0
      </Text>
      <Text style={styles.paragraph}>
        Voice Timer is a simple and flexible timer app designed for hands-free
        control.
      </Text>
      <Text style={styles.paragraph}>
        Whether you&apos;re cooking, stretching, working out, meditating, or
        just need a countdown you can talk to, this app keeps things easy and
        responsive.
      </Text>
      <Text style={styles.paragraph}>
        Use your voice to start, stop, and control the timer without needing to
        touch the screen.
      </Text>
      {/* <Text style={styles.paragraph}>
        It works offline and helps you stay in the flow — whatever you&apos;re
        doing.
      </Text> */}
      <Text style={styles.paragraph}>
        No tracking, no accounts, just a helpful timer.
      </Text>
      <Text style={styles.paragraph}>
        This app collects no data. It works fully offline.
      </Text>
      <Text> </Text>
      <Text style={styles.subtitle}>Voice Timer Tips</Text>
      <Text style={styles.paragraph}>
        For the best experience using voice commands, make sure you&apos;re in a
        quiet environment. Background noise can affect recognition accuracy.
        Also having vibration on may interfere with voice recognition and is not
        recommended when using voice commands.
      </Text>

      <Text style={styles.paragraph}>
        If the alarm sound is loud, your voice might need to be louder too. Try
        to speak clearly and close to the device when giving commands.
      </Text>

      <Text style={styles.paragraph}>
        If a full-screen notification appears, which happens only if the phone
        isn&apos;t in use, then voice commands won&apos;t work.
      </Text>

      <Text> </Text>
      {/* <Text style={styles.subtitle}>Attributions</Text> */}
      {/* <Text style={styles.paragraph}>
        This app uses Hotpot.ai for image generation.{" "}
        <Text style={[styles.paragraph, styles.linkBox]} onPress={openLink}>
          Link to hotpot.ai/art-generator
        </Text>
      </Text> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    color: Colors.primaryTint90,
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 600,
  },

  subtitle: {
    color: Colors.primaryTint90,
    marginBottom: 16,
    fontWeight: 600,
    fontSize: 18,
  },

  paragraph: {
    color: Colors.primaryTint90,
    marginBottom: 12,
    fontSize: 16,
  },

  linkBox: {
    fontSize: 16,
    color: Colors.primaryTint90,
    textDecorationLine: "underline",
  },
});
