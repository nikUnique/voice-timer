/* eslint-disable react-native/no-raw-text */
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import Section from "./Section";
import { BulletPoint, Label, Paragraph, Subtitle } from "./TextUnits";

export default function About() {
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

      <Subtitle>Voice Timer Tips</Subtitle>
      <Section>
        <Paragraph>
          For the best experience using voice commands, make sure you&apos;re in
          a quiet environment. Background noise can affect recognition accuracy.
          Also having vibration on may interfere with voice recognition and is
          not recommended when using voice commands.
        </Paragraph>

        <Paragraph>
          If the alarm sound is loud, your voice might need to be louder too.
          Try to speak clearly and close to the device when giving commands.
        </Paragraph>

        <Paragraph>
          If a full-screen notification appears, which happens only if the phone
          isn&apos;t in use, then voice commands won&apos;t work.
        </Paragraph>
      </Section>

      <Subtitle>Instructions On Naming Timers</Subtitle>

      <Section>
        <Paragraph>
          In the Voice Timer app, it&apos;s important to give each timer a
          unique and grammatically correct name to ensure accurate voice
          recognition. Timer names must consist of 1 to 2 words and should use
          only letters. Digits are not allowed, as the app is optimized for
          recognizing words rather than numbers.
        </Paragraph>

        <Paragraph>Valid examples:</Paragraph>
        {"\n"}
        {"\t".repeat(2)}
        <View style={styles.nestedStructure}>
          <BulletPoint>Morning Routine</BulletPoint>
          <BulletPoint>Workout Timer</BulletPoint>
          <BulletPoint>Break Time</BulletPoint>
        </View>

        {"\n\n"}
        <Label>What’s not allowed:</Label>
        <BulletPoint>
          Digits: Names like &quot;Timer 1&quot;, &quot;Cooking 2&quot;, or
          &quot;Work 3&quot; will not be accepted.
        </BulletPoint>
        <BulletPoint>
          Non-letter characters: Any characters other than letters will be
          rejected.
        </BulletPoint>

        {"\n\n"}

        <Label>Similar vs. Distinct Names</Label>

        <Paragraph>
          Although names can be similar, it’s a good idea to make each one
          distinct enough to avoid confusion. Here’s a comparison:
        </Paragraph>
        <BulletPoint>Similar names:</BulletPoint>
        {"\n"}
        {"\t".repeat(2)}
        <View>
          <BulletPoint>
            &quot;Workout&quot; and &quot;Work Out&quot;
          </BulletPoint>
          <BulletPoint>
            &quot;Study Timer&quot; and &quot;Study Time&quot;
          </BulletPoint>
          <BulletPoint>
            &quot;Cooking Timer&quot; and &quot;Cooking Time&quot;
          </BulletPoint>
        </View>
        <Paragraph>
          These names are close enough that they could lead to the wrong timer
          being activated, especially if the voice recognition picks up only
          part of the name.
        </Paragraph>

        <BulletPoint>Distinct names:</BulletPoint>
        {"\n"}
        {"\t".repeat(2)}
        <View>
          <BulletPoint>
            &quot;Morning Workout&quot; and &quot;Afternoon Break&quot;
          </BulletPoint>
          <BulletPoint>
            &quot;Laundry Timer&quot; and &quot;Cooking Session&quot;
          </BulletPoint>
          <BulletPoint>
            &quot;Reading Timer&quot; and &quot;Exercise Timer&quot;
          </BulletPoint>
        </View>

        <Paragraph>
          These names are clearly different from each other, making it easier
          for the app to recognize and activate the correct timer every time.
        </Paragraph>

        <Paragraph>
          By following these guidelines and choosing names that are both
          grammatically correct and distinct, you help ensure a smooth
          experience with the Voice Timer app.
        </Paragraph>
      </Section>
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
});
