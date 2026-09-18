import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Colors } from "../../constants/colors";
import { RADIUS } from "../../constants/radius";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import LoadingIndicator from "../../ui/LoadingIndicator";
import { capitalize } from "../../utils/helpers";

const VoiceDisabledBanner = memo(function VoiceDisabledBanner() {
  return (
    <View style={styles.banner}>
      <View style={[styles.iconBox, styles.dangerIconBox]}>
        <Ionicons
          name='mic-off-outline'
          size={18}
          color={Colors.dangerColor}
        />
      </View>
      <View>
        <Text style={styles.commandText}>Voice commands are off</Text>
        <Text style={styles.descriptionText}>
          Turn them on in Settings to control the timer hands-free.
        </Text>
      </View>
    </View>
  );
});

const ListHeader = memo(function ListHeader({ voiceEnabled }) {
  return (
    <>
      <Text style={styles.title}>Voice Commands</Text>
      {voiceEnabled && (
        <Text style={styles.subtitle}>
          Use the following voice commands to control the timer hands-free.
        </Text>
      )}
    </>
  );
});

export default memo(function Commands() {
  const [ready, setReady] = useState(false);
  const {
    isSkipCommandsEnabledRef,
    permitAnswerCallsRef,
    isVoiceFeedbackEnabled,
    voiceEnabled,
  } = useSettingsData();
  const { commandsRef } = useRefsData();

  const [isSkipEnabled, setIsSkipEnabled] = useState(
    () => isSkipCommandsEnabledRef?.current ?? false,
  );

  const [permitAnswerCalls, setPermitAnswerCalls] = useState(
    () => permitAnswerCallsRef?.current ?? false,
  );

  useFocusEffect(
    useCallback(() => {
      setIsSkipEnabled(isSkipCommandsEnabledRef?.current ?? false);
      setPermitAnswerCalls(permitAnswerCallsRef?.current ?? false);
    }, [isSkipCommandsEnabledRef, permitAnswerCallsRef]),
  );

  const {
    REPEAT = "",
    STOP = "",
    STOP_FINISHED = "",
    TIME = "",
    START = "",
    PAUSE = "",
    PLAY_MEDIA = "",
    STOP_MEDIA = "",
    RESUME = "",
    STATUS_REPORT = "",
    STATUS = "",
    TIMER_WAKE_UP = "",
    TIMER_GO_SLEEP = "",
    VOLUME_UP = "",
    VOLUME_DOWN = "",
    SKIP_NEXT = "",
    SKIP_PREVIOUS = "",
    CALL = "",
    RING = "",
  } = commandsRef?.current ?? {};

  const commands = useMemo(
    () => [
      {
        command: `${capitalize(START)} [timer name]`,
        example: `${capitalize(START)} Focus timer`,
        description: "Starts the named timer with its default duration.",
        icon: "play-outline",
        badge: "START",
      },
      {
        command: `${capitalize(PAUSE)} [timer name]`,
        example: `${capitalize(PAUSE)} Focus timer`,
        description: "Pauses the timer if it is running, otherwise no effect.",
        icon: "pause-outline",
        badge: "PAUSE",
      },
      {
        command: `${capitalize(RESUME)} [timer name]`,
        example: `${capitalize(RESUME)} Focus timer`,
        description:
          'Resumes the timer if paused. "Resume" is avoided as it can be misheard as "STOP".',
        icon: "play-skip-forward-outline",
        badge: "RESUME",
      },
      {
        command: `${capitalize(STOP)} [timer name]`,
        example: `${capitalize(STOP)} Focus timer`,
        description: "Stops the timer if it was paused, otherwise no effect.",
        icon: "refresh-outline",
        badge: "STOP",
      },
      {
        command: `${capitalize(REPEAT)}`,
        example: `${capitalize(REPEAT)}`,
        description:
          "Restarts the timer from the last individual timer command. Any command that used a specific timer counts - that timer will be restarted. E.g. if you last said 'start twenty minutes' or 'STOP twenty minutes', where 'twenty minutes' is one of your timers, saying 'Repeat' restarts the 'twenty-minutes' timer.",
        icon: "repeat-outline",
        badge: "REPEAT",
      },
      {
        command: `${capitalize(STOP_FINISHED)}`,
        example: `${capitalize(STOP_FINISHED)}`,
        description: "STOPs all timers that have run out of time.",
        icon: "checkmark-done-outline",
        badge: "BULK",
      },
      {
        command: `${capitalize(TIME)}`,
        example: `${capitalize(TIME)}`,
        description: "Tells you the exact time.",
        icon: "time-outline",
        badge: "TIME",
        disabled: !isVoiceFeedbackEnabled,
      },
      {
        command: `${capitalize(PLAY_MEDIA)}`,
        example: `${capitalize(PLAY_MEDIA)}`,
        description: `Resumes external media playback. While media is playing, only the "${capitalize(STOP_MEDIA)}" command is accepted - all other commands are ignored.`,
        icon: "play-circle-outline",
        badge: "PLAY",
      },
      {
        command: `${capitalize(STOP_MEDIA)}`,
        example: `${capitalize(STOP_MEDIA)}`,
        description:
          "Pauses external media and restores full voice control. Required before any other command will be accepted - while media is playing, this is the only command that works.",
        icon: "stop-circle-outline",
        badge: "STOP",
      },
      {
        command: `${capitalize(STATUS_REPORT)}`,
        example: `${capitalize(STATUS_REPORT)}`,
        description:
          "Reads out all timers and their current state - how many are running, paused, alarming, or not active.",
        icon: "list-outline",
        badge: "STATUS",
        disabled: !isVoiceFeedbackEnabled,
      },
      {
        command: `${capitalize(STATUS)} [timer name]`,
        example: `${capitalize(STATUS)} Focus timer`,
        description:
          "Reads the current state of a single timer - whether it is running, paused, alarming, or not active, and how much time is left.",
        icon: "timer-outline",
        badge: "STATUS",
        disabled: !isVoiceFeedbackEnabled,
      },
      {
        command: `${capitalize(TIMER_WAKE_UP)}`,
        example: `${capitalize(TIMER_WAKE_UP)}`,
        description:
          "Activates voice command listening. Timer will now respond to spoken commands.",
        icon: "mic-outline",
        badge: "WAKE",
      },
      {
        command: `${capitalize(TIMER_GO_SLEEP)}`,
        example: `${capitalize(TIMER_GO_SLEEP)}`,
        description:
          "Deactivates voice command listening. Timer will stop responding to spoken commands until woken up again. 'Stop all media' and 'play all media' still work while sleeping. Say 'timer wake up' to resume commands.",
        icon: "mic-off-outline",
        badge: "SLEEP",
      },
      {
        command: `${capitalize(VOLUME_UP)}`,
        example: `${capitalize(VOLUME_UP)}`,
        description: "Increases media volume by one step.",
        icon: "volume-high-outline",
        badge: "VOL+",
      },
      {
        command: `${capitalize(VOLUME_DOWN)}`,
        example: `${capitalize(VOLUME_DOWN)}`,
        description: "Decreases media volume by one step.",
        icon: "volume-low-outline",
        badge: "VOL-",
      },
      {
        command: `${capitalize(SKIP_NEXT)}`,
        example: `${capitalize(SKIP_NEXT)}`,
        description:
          "Lets you control media playback without interacting with the media app directly. Sends the next media command to the active media app, which determines the exact action.",
        icon: "play-skip-forward-outline",
        badge: "NEXT",
        disabled: !isSkipEnabled,
      },
      {
        command: `${capitalize(SKIP_PREVIOUS)}`,
        example: `${capitalize(SKIP_PREVIOUS)}`,
        description:
          "Lets you control media playback without interacting with the media app directly. Sends the previous media command to the active media app, which determines the exact action.",
        icon: "play-skip-back-outline",
        badge: "PREV",
        disabled: !isSkipEnabled,
      },
      {
        command: `${capitalize(CALL)}`,
        example: `${capitalize(CALL)} John`,
        description: "Places a call to the specified contact.",
        icon: "call-outline",
        badge: "CALL",
        disabled: !permitAnswerCalls,
      },
      {
        command: `${capitalize(RING)}`,
        example: `${capitalize(RING)} John`,
        description:
          "Places a call and automatically ends it if unanswered after a timeout.",
        icon: "notifications-outline",
        badge: "RING",
        disabled: !permitAnswerCalls,
      },
    ],
    [
      START,
      PAUSE,
      RESUME,
      STOP,
      REPEAT,
      STOP_FINISHED,
      TIME,
      isVoiceFeedbackEnabled,
      PLAY_MEDIA,
      STOP_MEDIA,
      STATUS_REPORT,
      STATUS,
      TIMER_WAKE_UP,
      TIMER_GO_SLEEP,
      VOLUME_UP,
      VOLUME_DOWN,
      SKIP_NEXT,
      isSkipEnabled,
      SKIP_PREVIOUS,
      CALL,
      permitAnswerCalls,
      RING,
    ],
  );

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const renderItem = useCallback(({ item }) => {
    const isDisabled = Boolean(item.disabled);

    return (
      <View style={[styles.card, isDisabled && styles.disabledCard]}>
        <View style={styles.iconBox}>
          <Ionicons
            name={item.icon}
            size={18}
            color={isDisabled ? Colors.grayTint20 : Colors.primaryTint40}
          />
        </View>
        <View style={styles.body}>
          <View style={[styles.badge, isDisabled && styles.disabledBadge]}>
            <Text
              style={[styles.badgeText, isDisabled && styles.disabledBadgeText]}
            >
              {isDisabled ? `${item.badge} (DISABLED)` : item.badge}
            </Text>
          </View>
          <Text style={styles.commandText}>{item.command}</Text>
          {item.example && (
            <Text style={styles.exampleText}>
              <Text style={styles.prompt}>&gt; </Text>&quot;{item.example}&quot;
            </Text>
          )}
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </View>
    );
  }, []);

  if (!ready) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {!voiceEnabled ? (
        <View style={styles.list}>
          <ListHeader voiceEnabled={voiceEnabled} />
          <VoiceDisabledBanner />
        </View>
      ) : (
        <FlatList
          data={commands}
          renderItem={renderItem}
          ListHeaderComponent={() => <ListHeader voiceEnabled={voiceEnabled} />}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.badge}-${index}`}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACE.xl,
  },
  list: {
    flex: 1,
  },
  title: {
    fontSize: FONT.heading,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
    marginBottom: SPACE.xl,
  },
  subtitle: {
    fontSize: FONT.subheading,
    color: Colors.primaryTint70,
    marginBottom: SPACE.xxl,
  },
  card: {
    backgroundColor: Colors.primaryShade50,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingVertical: SPACE.xl,
    paddingRight: SPACE.xl,
    paddingLeft: SPACE.lg,
    flexDirection: "row",
    gap: SPACE.xl,
    marginBottom: SPACE.lg,
  },
  disabledCard: {
    opacity: 0.8,
    borderLeftColor: Colors.grayTint20,
  },
  body: {
    flex: 1,
    gap: SPACE.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: Colors.primaryTint8Alpha15,
    borderWidth: 1,
    borderColor: Colors.primaryTint8Alpha30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACE.xs,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primaryTint40Alpha40,
    borderRadius: RADIUS.tight,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    backgroundColor: Colors.primaryTint40Alpha8,
    marginBottom: SPACE.xs,
  },
  disabledBadge: {
    borderColor: Colors.grayTint20,
    backgroundColor: "transparent",
  },
  badgeText: {
    fontSize: FONT.caption,
    letterSpacing: 1.1,
    color: Colors.primaryTint40,
  },
  disabledBadgeText: {
    color: Colors.grayTint20,
  },
  commandText: {
    fontSize: FONT.body,
    fontWeight: WEIGHT.semibold,
    color: Colors.primaryTint90,
  },
  exampleText: {
    fontSize: FONT.caption,
    color: Colors.primaryTint8,
  },
  descriptionText: {
    fontSize: FONT.caption,
    color: Colors.grayTint20,
    lineHeight: 18,
  },
  prompt: {
    color: Colors.primaryShade30,
    fontWeight: WEIGHT.bold,
    fontSize: FONT.body,
  },
  banner: {
    backgroundColor: Colors.primaryShade50,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    paddingVertical: SPACE.xl,
    paddingRight: SPACE.xl,
    paddingLeft: SPACE.lg,
    flexDirection: "row",
    gap: SPACE.xl,
    marginBottom: SPACE.lg,
  },
  dangerIconBox: {
    borderColor: Colors.dangerAlpha30 ?? Colors.danger,
    backgroundColor: Colors.dangerAlpha15 ?? "rgba(255,107,107,0.15)",
  },
});
