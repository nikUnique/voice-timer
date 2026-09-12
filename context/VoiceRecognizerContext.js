import { createContext, useContext, useMemo, useRef, useState } from "react";
import useVoiceRecognizerContext from "./useVoiceRecognizerContext";

const VoiceRecognizerContext = createContext();
const SoundContext = createContext();
const RefsContext = createContext();
const SettingsContext = createContext();
const ContactsContext = createContext();

export default function VoiceRecognizerProvider({ children }) {
  const [isAlarmingScreen, setIsAlarmingScreen] = useState(false);
  const [alertingTimerNames, setAlertingTimerNames] = useState([]);
  const [language, setLanguage] = useState("en");
  const [isLocked, setIsLocked] = useState(false);

  const isListeningRef = useRef(false);
  const isValidCommandRef = useRef(false);
  const isMediaPausedRef = useRef(false);
  const isMediaPlayingRef = useRef(false);
  const isTimerSleepingRef = useRef(false);
  const ignoreUntilRef = useRef(null);
  const isMediaPausedManuallyRef = useRef(false);
  const resultEventRef = useRef(null);

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
  const [recognizedCommand, setRecognizedCommand] = useState();
  const [recognizedTime, setRecognizedTime] = useState();
  const [isListening, setIsListening] = useState(false);
  const recognizedCommandRef = useRef(null);
  const prevRecognizedCommandRef = useRef(null);
  const secretIdentifierRef = useRef("");
  const commandsRef = useRef(null);
  const currentSpeechRef = useRef(null);

  // Full-screen notification
  const currentActivityRef = useRef("");
  const appStateRef = useRef("active");
  const wasActiveBeforeLockRef = useRef(false);
  const previousLockedRef = useRef(false);
  const isFullScreenNotificationRef = useRef(false);

  // Timers
  const workingTimersRef = useRef([]);
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
  const [isHeadsetBroken, setIsHeadsetBroken] = useState(false);
  const dimScreenRef = useRef(null);
  const voiceFeedbackSpeedRef = useRef(0.8);
  const permitAnswerCallsRef = useRef(false);
  const makePhoneCallsRef = useRef(false);

  // Contacts
  const [contacts, setContacts] = useState([
    { id: "1", name: "James Carter", phone: "+15551234567" },
    { id: "2", name: "Maria Lopez", phone: "+15552345678" },
    { id: "3", name: "David Kim", phone: "+15553456789" },
    { id: "4", name: "Sarah Johnson", phone: "+15554567890" },
    { id: "5", name: "Michael Brown", phone: "+15555678901" },
    { id: "6", name: "Emily Davis", phone: "+15556789012" },
    { id: "7", name: "Daniel Wilson", phone: "+15557890123" },
    { id: "8", name: "Olivia Martinez", phone: "+15558901234" },
    { id: "9", name: "Ryan Anderson", phone: "+15559012345" },
    { id: "10", name: "Sophia Thomas", phone: "+15550123456" },
    { id: "11", name: "Ethan Moore", phone: "+15551987654" },
    { id: "12", name: "Grace Taylor", phone: "+15552876543" },
    { id: "13", name: "Noah Jackson", phone: "+15553765432" },
    { id: "14", name: "Ava White", phone: "+15554654321" },
    { id: "15", name: "Liam Harris", phone: "+15555543210" },
  ]);

  const { allTimers, dynamicGrammar, allActions } = useVoiceRecognizerContext({
    commandsRef,
    language,
    timers,
    secretIdentifierRef,
    contacts,
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
      prevRecognizedCommandRef,
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
      isTimerSleepingRef,
      ignoreUntilRef,
      isMediaPausedManuallyRef,
      resultEventRef,
      currentSpeechRef,
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
      voiceFeedbackSpeedRef,
      permitAnswerCallsRef,
      makePhoneCallsRef,
      isHeadsetBroken,
      setIsHeadsetBroken,
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
      isHeadsetBroken,
    ],
  );

  const contactsData = useMemo(
    () => ({
      contacts,
      setContacts,
    }),
    [contacts],
  );

  return (
    <VoiceRecognizerContext.Provider value={value}>
      <SoundContext.Provider value={soundData}>
        <RefsContext.Provider value={refsData}>
          <SettingsContext.Provider value={settingsData}>
            <ContactsContext.Provider value={contactsData}>
              {children}
            </ContactsContext.Provider>
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

export function useContactsData() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error(
      "Contacts context was used outside of VoiceRecognizerProvider",
    );
  }
  return context;
}
