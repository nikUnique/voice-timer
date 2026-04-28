import Tts from "react-native-tts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDefaultTimers } from "../hooks/useDefaultTimers";

const VoiceRecognizerContext = createContext();
const SoundContext = createContext();
const RefsContext = createContext();
const SettingsContext = createContext();

export default function VoiceRecognizerProvider({ children }) {
  const [recognizedCommand, setRecognizedCommand] = useState();
  const [recognizedTime, setRecognizedTime] = useState();
  const [isListening, setIsListening] = useState(false);
  const [isAlarmingScreen, setIsAlarmingScreen] = useState(false);
  const [alertingTimerNames, setAlertingTimerNames] = useState([]);
  const [language, setLanguage] = useState("en");
  const [isLocked, setIsLocked] = useState(false);

  const isListeningRef = useRef(false);
  const isValidCommandRef = useRef(false);

  // Sound
  const soundRef = useRef(null);
  const shortSoundRef = useRef(null);
  const soundStatusRef = useRef(null);
  const soundIsPlayingRef = useRef(false);

  // Alerting
  const alertingTimerNamesRef = useRef([]);
  const alertTimeoutRef = useRef(null);

  // Notification
  const notificationTypeRef = useRef(null);
  const notificationIdRef = useRef("_NOTIFICATION");
  const notificationTitleRef = useRef("");
  const notificationBodyRef = useRef("");
  const leastTimeTimerRef = useRef(null);
  const ongoingNotificationLabelRef = useRef(null);
  const timersTimesRef = useRef([]);

  // Command recognition
  const recognizedCommandRef = useRef(null);
  const secretIdentifierRef = useRef("");
  const commandsRef = useRef(null);

  // Full-screen notification
  const currentActivityRef = useRef("");
  const appStateRef = useRef("active");
  const wasActiveBeforeLockRef = useRef(false);
  const previousLockedRef = useRef(false);
  const isFullScreenNotificationRef = useRef(false);

  // Timers
  const workingTimersRef = useRef([]);
  const { defaultTimers } = useDefaultTimers();
  const [timers, setTimers] = useState([]);
  const [editableTimers, setEditableTimers] = useState([]);
  const [timersHistory, setTimersHistory] = useState([]);
  const [timerHeight, setTimerHeight] = useState(0);
  const allTimersRef = useRef(timers);
  const freshlyCreatedTimerRef = useRef(null);
  const lastTimerStartedRef = useRef(null);
  const activateTimerRef = useRef(null);
  const dictionaryRef = useRef(null);
  const dictionary2Ref = useRef(null);
  const dictionaryTypoRef = useRef(null);
  const currentlyViewedItemRef = useRef(null);
  const isFocusedRef = useRef(null);

  // Settings
  const [screenTimeout, setScreenTimeout] = useState(1000 * 60 * 5);
  const [successSound, setSuccessSound] = useState("success.mp3");
  const [alertSound, setAlertSound] = useState("joy.mp3");
  const [discoSound, setDiscoSound] = useState("disco.wav");
  const [alarmVolume, setAlarmVolume] = useState(0.1);
  const [autoStopAlarmTimeout, setAutoStopAlarmTimeout] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [microGranted, setMicroGranted] = useState(false);
  const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);
  const [keepScreenOnCommand, setKeepScreenOnCommand] = useState(true);
  const [keepScreenOnMinutes, setKeepScreenOnMinutes] = useState(5);
  const [isVibrating, setIsVibrating] = useState(false);
  const dimScreenRef = useRef(null);

  const { START, CONTINUE, RESET, PAUSE, REPEAT, RESET_FINISHED, DISCO } =
    commandsRef.current ? commandsRef.current : {};

  const getCommands = useCallback(async function getCommands(lang) {
    switch (lang) {
      case "en":
      default:
        commandsRef.current = await import("../utils/en_commands");
    }
  }, []);

  useEffect(
    function () {
      getCommands(language);
    },
    [language, getCommands],
  );

  function pickBestVoice(voices) {
    const enUs = voices.filter(
      (v) => v.language === "en-US" && !v.notInstalled,
    );
    // offline first, then by quality desc
    const sorted = enUs.sort((a, b) => {
      if (a.networkConnectionRequired !== b.networkConnectionRequired)
        return a.networkConnectionRequired ? 1 : -1; // offline first
      return b.quality - a.quality; // higher quality first
    });
    return sorted[0] ?? null;
  }
  useEffect(() => {
    Tts.getInitStatus().then(async () => {
      Tts.setDefaultLanguage("en-US");
      const available = await Tts.voices();
      // console.log(available);

      const bestVoice = pickBestVoice(available);
      // console.log(bestVoice.name + "The best voice 📹");
      // console.log(bestVoice.quality + "Quality");

      await Tts.setDefaultVoice(bestVoice);
    });
  }, []);

  const voiceOptions = useMemo(
    () => ({
      onStart: () => {
        console.log("Started talking...");
        isListeningRef.current = false;
        setIsListening(false);
      },
      onStopped: () => {
        isListeningRef.current = true;
        setIsListening(true);
        console.log("Speech stopped");
      },
      onDone: () => {
        isListeningRef.current = true;
        setIsListening(true);
      },
      onError: () => {
        console.error("An error occurred during speech utterance");
      },
    }),
    [],
  );

  const allTimers = timers.map((timer) => timer.name);

  const allActions = useMemo(
    () => [START, CONTINUE, RESET, PAUSE],
    [CONTINUE, PAUSE, RESET, START],
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
      ]
        .flatMap((command) => command)
        .map((item) => `${item} ${secretIdentifierRef.current}`.trim()),
    [DISCO, REPEAT, RESET_FINISHED, allActions, timers],
  );

  const dynamicGrammar = useMemo(
    () => [...dynamicGrammarFirst, ["unk"]],
    [dynamicGrammarFirst],
  );

  const value = useMemo(
    () => ({
      recognizedCommand,
      setRecognizedCommand,
      dynamicGrammar,
      isListening,
      alertingTimerNames,
      timers,
      allActions,
      allTimers,
      timersHistory,
      setTimersHistory,
      setTimers,
      isAlarmingScreen,
      recognizedTime,
      setRecognizedTime,
      isValidCommandRef,
      alertingTimerNamesRef,
      isLocked,
      editableTimers,
      setEditableTimers,
    }),
    [
      recognizedCommand,
      dynamicGrammar,
      isListening,
      alertingTimerNames,
      timers,
      allActions,
      allTimers,
      timersHistory,
      isAlarmingScreen,
      recognizedTime,
      isLocked,
      editableTimers,
    ],
  );

  const soundData = useMemo(
    () => ({
      soundRef,
      shortSoundRef,
      soundStatusRef,
      soundIsPlayingRef,
      alertTimeoutRef,
    }),
    [],
  );

  const refsData = useMemo(
    () => ({
      voiceOptions,
      secretIdentifierRef,
      setIsListening,
      setIsAlarmingScreen,
      setTimersHistory,
      setAlertingTimerNames,
      setIsLocked,
      setTimers,
      timers,
      notificationTypeRef,
      alertingTimerNamesRef,
      notificationIdRef,
      notificationTitleRef,
      leastTimeTimerRef,
      timersTimesRef,
      workingTimersRef,
      recognizedCommandRef,
      commandsRef,
      isListeningRef,
      notificationBodyRef,
      isFullScreenNotificationRef,
      currentActivityRef,
      appStateRef,
      wasActiveBeforeLockRef,
      previousLockedRef,
      ongoingNotificationLabelRef,
      freshlyCreatedTimerRef,
      activateTimerRef,
      dictionaryRef,
      dictionary2Ref,
      dictionaryTypoRef,
      lastTimerStartedRef,
      allTimersRef,
      editableTimers,
      timerHeight,
      setTimerHeight,
      currentlyViewedItemRef,
      isFocusedRef,
    }),
    [editableTimers, timerHeight, timers, voiceOptions],
  );

  const settingsData = useMemo(
    () => ({
      screenTimeout,
      setScreenTimeout,
      successSound,
      setSuccessSound,
      alertSound,
      setAlertSound,
      autoStopAlarmTimeout,
      setAutoStopAlarmTimeout,
      alarmVolume,
      setAlarmVolume,
      voiceEnabled,
      setVoiceEnabled,
      isVoiceFeedbackEnabled,
      setIsVoiceFeedbackEnabled,
      keepScreenOnCommand,
      setKeepScreenOnCommand,
      keepScreenOnMinutes,
      setKeepScreenOnMinutes,
      isVibrating,
      setIsVibrating,
      discoSound,
      microGranted,
      setMicroGranted,
      dimScreenRef,
    }),
    [
      screenTimeout,
      successSound,
      alertSound,
      autoStopAlarmTimeout,
      alarmVolume,
      voiceEnabled,
      isVoiceFeedbackEnabled,
      keepScreenOnCommand,
      keepScreenOnMinutes,
      isVibrating,
      discoSound,
      microGranted,
    ],
  );

  return (
    <VoiceRecognizerContext.Provider value={value}>
      <SoundContext.Provider value={soundData}>
        <RefsContext.Provider value={refsData}>
          <SettingsContext.Provider value={settingsData}>
            {children}
          </SettingsContext.Provider>
        </RefsContext.Provider>
      </SoundContext.Provider>
    </VoiceRecognizerContext.Provider>
  );
}

export function useRecognizerData() {
  const context = useContext(VoiceRecognizerContext);
  if (context === undefined) {
    throw new Error(
      "Voice recognizer context was used outside of VoiceRecognizerProvider",
    );
  }
  return context;
}

export function useSoundData() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error(
      "Sound context was used outside of VoiceRecognizerProvider",
    );
  }
  return context;
}
export function useRefsData() {
  const context = useContext(RefsContext);
  if (context === undefined) {
    throw new Error("Refs context was used outside of VoiceRecognizerProvider");
  }
  return context;
}

export function useSettingsData() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "Settings context was used outside of VoiceRecognizerProvider",
    );
  }
  return context;
}
