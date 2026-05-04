import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useDefaultTimers } from "../hooks/useDefaultTimers";
import useVoiceRecognizerContext from "./useVoiceRecognizerContext";

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
  const isMediaPausedRef = useRef(false);
  const isMediaPlayingRef = useRef(false);

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
  const [keepScreenDim, setKeepScreenDim] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const dimScreenRef = useRef(null);

  const { allTimers, dynamicGrammar, allActions } = useVoiceRecognizerContext({
    commandsRef,
    language,
    timers,
    secretIdentifierRef,
  });

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
      isMediaPausedRef,
      isMediaPlayingRef,
    }),
    [editableTimers, timerHeight, timers],
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
      keepScreenDim,
      setKeepScreenDim,
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
      keepScreenDim,
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
