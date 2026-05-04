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
    CONTINUE,
    RESET,
    PAUSE,
    REPEAT,
    RESET_FINISHED,
    DISCO,
    TIME,
    PLAY_MEDIA,
    STOP_MEDIA,
    STATUS_REPORT,
    STATUS,
  } = commandsRef.current ? commandsRef.current : {};

  useEffect(
    function () {
      getCommands(language);
    },
    [language, getCommands],
  );

  const allTimers = timers.map((timer) => timer.name);

  const allActions = useMemo(
    () => [START, CONTINUE, RESET, PAUSE, STATUS],
    [CONTINUE, PAUSE, RESET, START, STATUS],
  );

  const dynamicGrammarFirst = useMemo(
    () =>
      [
        ...timers.map((timer) =>
          allActions.map((action) => `${action} ${timer.name}`.toLowerCase()),
        ),
        REPEAT,
        RESET_FINISHED,
        DISCO,
        TIME,
        PLAY_MEDIA,
        STOP_MEDIA,
        STATUS_REPORT,
      ]
        .flatMap((command) => command)
        .map((item) => `${item} ${secretIdentifierRef.current}`.trim()),
    [
      DISCO,
      PLAY_MEDIA,
      REPEAT,
      RESET_FINISHED,
      STATUS_REPORT,
      STOP_MEDIA,
      TIME,
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
