import { useCallback, useEffect, useMemo } from "react";

export default function useVoiceRecognizerContext({
  commandsRef,
  language,
  timers,
  secretIdentifierRef,
}) {
  const getCommands = useCallback(
    async function getCommands(lang) {
      switch (lang) {
        case "en":
        default:
          commandsRef.current = await import("../utils/en_commands");
      }
    },
    [commandsRef],
  );

  const {
    START,
    RESUME,
    STOP,
    PAUSE,
    REPEAT,
    STOP_FINISHED,
    DISCO,
    TIME,
    PLAY_MEDIA,
    STOP_MEDIA,
    STATUS_REPORT,
    STATUS,
    TIMER_WAKE_UP,
    TIMER_GO_SLEEP,
    VOLUME_UP,
    VOLUME_DOWN,
    ANSWER_CALL,
  } = commandsRef.current ? commandsRef.current : {};

  useEffect(
    function () {
      getCommands(language);
    },
    [language, getCommands],
  );

  const allTimers = timers.map((timer) => timer.name);

  const allActions = useMemo(
    () => [START, RESUME, STOP, PAUSE, STATUS],
    [RESUME, PAUSE, STOP, START, STATUS],
  );

  const dynamicGrammarFirst = useMemo(
    () =>
      [
        ...timers.map((timer) =>
          allActions.map((action) => `${action} ${timer.name}`.toLowerCase()),
        ),
        REPEAT,
        STOP_FINISHED,
        DISCO,
        TIME,
        PLAY_MEDIA,
        STOP_MEDIA,
        STATUS_REPORT,
        TIMER_WAKE_UP,
        TIMER_GO_SLEEP,
        VOLUME_UP,
        VOLUME_DOWN,
        ANSWER_CALL,
      ]
        .flatMap((command) => command)
        .map((item) => `${item} ${secretIdentifierRef.current}`.trim()),
    [
      ANSWER_CALL,
      DISCO,
      PLAY_MEDIA,
      REPEAT,
      STOP_FINISHED,
      STATUS_REPORT,
      STOP_MEDIA,
      TIME,
      TIMER_GO_SLEEP,
      TIMER_WAKE_UP,
      VOLUME_DOWN,
      VOLUME_UP,
      allActions,
      secretIdentifierRef,
      timers,
    ],
  );

  const dynamicGrammar = useMemo(
    () => [...dynamicGrammarFirst, ["unk"]],
    [dynamicGrammarFirst],
  );

  useEffect(
    function () {
      getCommands(language);
    },
    [language, getCommands],
  );

  return { allTimers, dynamicGrammar, allActions };
}
