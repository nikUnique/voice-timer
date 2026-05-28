/* eslint-disable react-native/no-raw-text */
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import Section from "./Section";
import { BulletPoint, Label, Paragraph, Subtitle } from "./TextUnits";
import { useRefsData } from "../context/VoiceRecognizerContext";

export default function About() {
  const { commandsRef } = useRefsData();

  const {
    REPEAT,
    RESET,
    RESET_FINISHED,
    DISCO,
    TIME,
    PLAY_MEDIA,
    STOP_MEDIA,
    STATUS_REPORT,
    TIMER_WAKE_UP,
    TIMER_GO_SLEEP,
    VOLUME_UP,
    VOLUME_DOWN,
  } = commandsRef?.current ? commandsRef.current : {};
  return (
    <ScrollView
      style={{
        paddingHorizontal: 24,
        marginBottom: 32,
        marginTop: 16,
      }}
    >
      <Text style={styles.title}>About</Text>
      <Text style={styles.subtitle}>
        <Text style={{ fontWeight: "bold" }}>Voice Timer</Text> – v0.1.0
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

      <Text style={styles.paragraph}>
        No tracking, no accounts, just a helpful timer.
      </Text>
      <Text style={styles.paragraph}>
        This app collects no data. It works fully offline.
      </Text>
      <Text> </Text>

      <Subtitle>Voice Timer Tips</Subtitle>

      <Paragraph>
        For the best experience using voice commands, make sure you&apos;re in a
        quiet environment. Background noise can affect recognition accuracy.
        Also having vibration on may interfere with voice recognition and is not
        recommended when using voice commands.
      </Paragraph>

      <Paragraph>
        If the alarm sound is loud, your voice might need to be louder too. Try
        to speak clearly and close to the device when giving commands.
      </Paragraph>

      {/* <Paragraph>
          If a full-screen notification appears, which happens only if the phone
          isn&apos;t in use, then voice commands won&apos;t work.
        </Paragraph> */}

      <Paragraph></Paragraph>

      <Subtitle>Using Media in Foreground and Background</Subtitle>
      <Paragraph>
        The app can listen for voice commands even when running in the
        background or with the screen locked. External media - music, podcasts,
        videos - can keep playing whether the app is open or not.
      </Paragraph>

      <Paragraph>
        To use any voice command while media is playing, say &quot;{STOP_MEDIA}
        &quot; first. This pauses playback and activates voice control. You can
        then say &quot;{PLAY_MEDIA}&quot; to continue playback.
      </Paragraph>

      <Paragraph>
        Pausing and resuming external media only works when controlled through
        the Voice Timer app using voice commands. If you pause external media
        using earphone buttons or directly inside the media app, the app loses
        control over playback and will not be able to resume it.
      </Paragraph>

      <Paragraph>
        Voice input works with your device mic or wired earphones only -
        Bluetooth is not supported.
      </Paragraph>

      <Paragraph></Paragraph>

      <Subtitle>Instructions On Naming Timers</Subtitle>

      <Section>
        <Paragraph>
          In the Voice Timer app, it&apos;s important to give each timer a
          unique and grammatically correct name to ensure accurate voice
          recognition. Timer names must consist of 1 to 2 words and should use
          only letters. Digits are not allowed, as the app is optimized for
          recognizing words rather than numbers.
        </Paragraph>

        <Label>Valid examples:</Label>
        {/* <Paragraph> */}
        <View>
          <BulletPoint>Morning Routine</BulletPoint>
          <BulletPoint>Workout Timer</BulletPoint>
          <BulletPoint>Break Time</BulletPoint>
        </View>
        {/* </Paragraph> */}

        <Label>What’s not allowed:</Label>
        {/* <Paragraph> */}
        <View>
          <BulletPoint>
            Digits: Names like &quot;Timer 1&quot;, &quot;Cooking 2&quot;, or
            &quot;Work 3&quot; will not be accepted.
          </BulletPoint>
          <BulletPoint>
            Non-letter characters: Any characters other than letters will be
            rejected.
          </BulletPoint>
        </View>
        {/* </Paragraph> */}
        <Paragraph></Paragraph>

        <Label>Similar vs. Distinct Names</Label>

        <Paragraph>
          Although names can be similar, it’s a good idea to make each one
          distinct enough to avoid confusion. Here’s a comparison:
        </Paragraph>
        <Label>Similar names:</Label>
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

        <Label>Distinct names:</Label>
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
