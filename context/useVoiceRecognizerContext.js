import { useCallback, useEffect, useMemo } from "react";

export default function useVoiceRecognizerContext({
  commandsRef,
  language,
  timers,
  contacts,
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
    SKIP_NEXT,
    SKIP_PREVIOUS,
    CALL,
    YES,
    NO,
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

  const allContactsNames = useMemo(
    () => contacts.map((contact) => contact.name.toLowerCase()),
    [contacts],
  );

  const dynamicGrammarFirst = useMemo(
    () =>
      [
        ...timers.map((timer) =>
          allActions.map((action) => `${action} ${timer.name}`.toLowerCase()),
        ),
        allContactsNames.map((contact) => `${CALL} ${contact}`),
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
        SKIP_NEXT,
        SKIP_PREVIOUS,
        YES,
        NO,
      ]
        .flatMap((command) => command)
        .map((item) => `${item} ${secretIdentifierRef.current}`.trim()),
    [
      timers,
      allContactsNames,
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
      SKIP_NEXT,
      SKIP_PREVIOUS,
      YES,
      NO,
      allActions,
      CALL,
      secretIdentifierRef,
    ],
  );

  const dynamicGrammar = useMemo(
    () => [...dynamicGrammarFirst, ["unk"]],
    [dynamicGrammarFirst],
  );

  // console.log(dynamicGrammar, "grammar");

  useEffect(
    function () {
      getCommands(language);
    },
    [language, getCommands],
  );

  return { allTimers, dynamicGrammar, allActions };
}
