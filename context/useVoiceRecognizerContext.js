import { useCallback, useEffect, useMemo, useState } from "react";

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

  // commandsRef.current is populated asynchronously by getCommands (below).
  // Reading it during render is both flagged by react-hooks/refs and fragile:
  // a ref write does not trigger a re-render, so the grammar only picked up
  // the loaded commands when some unrelated state (timers/contacts) happened
  // to re-render afterward. Hold the loaded commands in state so the grammar
  // rebuilds deterministically the moment they resolve.
  const [commands, setCommands] = useState({});

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
    SKIP_BACK,
    CALL,
    SHORT_CALL,
    MINUTE_CALL,
    YES,
    NO,
  } = commands;

  useEffect(
    function () {
      let cancelled = false;
      (async function () {
        await getCommands(language);
        if (!cancelled) {
          setCommands(commandsRef.current ?? {});
        }
      })();
      return function () {
        cancelled = true;
      };
    },
    [language, getCommands, commandsRef],
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
        allContactsNames.map((contact) => `${SHORT_CALL} ${contact}`),
        allContactsNames.map((contact) => `${MINUTE_CALL} ${contact}`),
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
        SKIP_BACK,
        YES,
        NO,
      ]
        .flatMap((command) => command)
        // secretIdentifierRef is a reserved wake-word suffix (always "" today;
        // matching logic in useExecuteCommand already expects it). Reading it
        // here is intentional scaffolding, not a stale-closure bug: it is never
        // written, so the value is constant.
        // eslint-disable-next-line react-hooks/refs
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
      SKIP_BACK,
      YES,
      NO,
      allActions,
      CALL,
      SHORT_CALL,
      MINUTE_CALL,
      secretIdentifierRef,
    ],
  );

  const dynamicGrammar = useMemo(
    () => [...dynamicGrammarFirst, ["unk"]],
    [dynamicGrammarFirst],
  );

  // console.log(dynamicGrammar, "grammar");

  return { allTimers, dynamicGrammar, allActions };
}
