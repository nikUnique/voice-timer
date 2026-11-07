import { useCallback, useEffect, useRef } from "react";
import { NativeModules } from "react-native";
import Tts from "react-native-tts";
import * as vosk from "react-native-vosk";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import { TTS_TIMEOUT, VOICE_FEEDBACK_SPEEDS } from "../../utils/config";
import { sleep } from "../../utils/helpers";
import { getSharedObject } from "../../utils/sharedVariables";

export const ttsSpeak = { current: null };

export function useTTS() {
  const {
    isListeningRef,
    setIsListening,
    isMediaPausedRef,
    isMediaPausedManuallyRef,
    currentSpeechRef,
    ignoreUntilRef,
    resultEventRef,
  } = useRefsData();
  const {
    isVoiceFeedbackEnabled,
    voiceFeedbackSpeedRef,
    voiceFeedbackPitchRef,
  } = useSettingsData();

  const pendingRef = useRef(new Map());

  const releaseAudioFocus = useCallback(
    function () {
      if (
        !isMediaPausedRef.current &&
        !isMediaPausedManuallyRef.current &&
        !getSharedObject().alertingTimerNames.length
      ) {
        console.log("Is it released 🎱");
        NativeModules.AudioFocusModule.releaseAudioFocus();
      }
    },
    [isMediaPausedManuallyRef, isMediaPausedRef],
  );

  const resumeRecognizer = useCallback(function resumeRecognizer() {
    try {
      vosk.reset();
    } catch (error) {
      console.error("An error occurred while resetting vosk", error);
    }
  }, []);

  const startTalking = useCallback(
    function startTalking() {
      isListeningRef.current = false;
      setIsListening(false);
    },
    [isListeningRef, setIsListening],
  );

  const doneTalking = useCallback(
    async function doneTalking(e) {
      releaseAudioFocus();
      console.log("Done talking");
      ignoreUntilRef.current = Date.now() + 500;
      currentSpeechRef.current = "";
      resumeRecognizer();
      setTimeout(function () {
        resumeRecognizer();
      }, 100);
      setTimeout(function () {
        resumeRecognizer();
      }, 200);
      setTimeout(function () {
        resumeRecognizer();
      }, 300);
      setTimeout(function () {
        resumeRecognizer();
      }, 400);
      setTimeout(function () {
        resumeRecognizer();
      }, 500);
      isListeningRef.current = true;
      setIsListening(true);
    },
    [
      currentSpeechRef,
      ignoreUntilRef,
      isListeningRef,
      releaseAudioFocus,
      resumeRecognizer,
      setIsListening,
    ],
  );

  const errorTalking = useCallback(
    function errorTalking() {
      releaseAudioFocus();
      resumeRecognizer();
      console.error("An error occurred during speech utterance");
    },
    [releaseAudioFocus, resumeRecognizer],
  );

  const speak = useCallback(
    async function speak(text, options = {}) {
      try {
        if (!isVoiceFeedbackEnabled) {
          return;
        }
        currentSpeechRef.current = text.toLowerCase();
        if (text.trim()) {
          resultEventRef.current?.remove();
          setIsListening(false);
          isListeningRef.current = false;
          await Tts.setDefaultRate(
            +voiceFeedbackSpeedRef.current ||
              VOICE_FEEDBACK_SPEEDS.find(
                (option) => option.label.toLowerCase() === "normal",
              ).value,
          );
          await Tts.setDefaultPitch(+voiceFeedbackPitchRef.current || 1);
          if (
            !options?.skipWiredDelay &&
            (await NativeModules.AudioFocusModule.isWiredHeadsetConnected())
          ) {
            await sleep(0.5);
          }
          const utteranceId = await Tts.speak(text);
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              const p = pendingRef.current.get(utteranceId);
              if (p) {
                pendingRef.current.delete(utteranceId);
                isListeningRef.current = true;
                setIsListening(true);
                resumeRecognizer();
                reject(new Error(`TTS timed out after ${TTS_TIMEOUT}ms`));
              }
            }, TTS_TIMEOUT);
            pendingRef.current.set(utteranceId, { resolve, reject, timer });
          });
        }
      } catch (error) {
        console.error("An error occurred in the speak function 🤯", error);
      }
    },
    [
      currentSpeechRef,
      isListeningRef,
      isVoiceFeedbackEnabled,
      resultEventRef,
      setIsListening,
      voiceFeedbackSpeedRef,
      voiceFeedbackPitchRef,
      resumeRecognizer,
    ],
  );

  useEffect(
    function () {
      ttsSpeak.current = speak;
    },
    [speak],
  );

  useEffect(function () {
    function pickBestVoice(voices) {
      const enUs = voices.filter(
        (v) => v.language === "en-US" && !v.notInstalled,
      );
      const sorted = enUs.sort((a, b) => {
        if (a.networkConnectionRequired !== b.networkConnectionRequired)
          return a.networkConnectionRequired ? 1 : -1;
        return b.quality - a.quality;
      });
      return sorted[0] ?? null;
    }
    Tts.getInitStatus().then(async () => {
      Tts.setDefaultLanguage("en-US");
      const available = await Tts.voices();
      const bestVoice = pickBestVoice(available);
      if (bestVoice) {
        await Tts.setDefaultVoice(bestVoice.id);
      }
    });
  }, []);

  useEffect(
    function () {
      const subs = [];
      subs.push(Tts.addEventListener("tts-start", startTalking));
      subs.push(
        Tts.addEventListener("tts-finish", (e) => {
          const id = e?.utteranceId;
          let p = id != null ? pendingRef.current.get(id) : null;
          if (!p && pendingRef.current.size === 1) {
            const onlyKey = pendingRef.current.keys().next().value;
            p = pendingRef.current.get(onlyKey);
            if (p) pendingRef.current.delete(onlyKey);
          } else if (p) {
            pendingRef.current.delete(id);
          }
          if (p) {
            clearTimeout(p.timer);
            p.resolve({ status: "finished" });
          }
          doneTalking(e);
        }),
      );
      subs.push(
        Tts.addEventListener("tts-cancel", (e) => {
          const id = e?.utteranceId;
          let p = id != null ? pendingRef.current.get(id) : null;
          if (!p && pendingRef.current.size === 1) {
            const onlyKey = pendingRef.current.keys().next().value;
            p = pendingRef.current.get(onlyKey);
            if (p) pendingRef.current.delete(onlyKey);
          } else if (p) {
            pendingRef.current.delete(id);
          }
          if (p) {
            clearTimeout(p.timer);
            p.resolve({ status: "cancelled" });
          }
          releaseAudioFocus();
          resumeRecognizer();
        }),
      );
      subs.push(
        Tts.addEventListener("tts-error", (e) => {
          const id = e?.utteranceId;
          let p = id != null ? pendingRef.current.get(id) : null;
          if (!p && pendingRef.current.size === 1) {
            const onlyKey = pendingRef.current.keys().next().value;
            p = pendingRef.current.get(onlyKey);
            if (p) pendingRef.current.delete(onlyKey);
          } else if (p) {
            pendingRef.current.delete(id);
          }
          if (p) {
            clearTimeout(p.timer);
            p.reject(e);
          }
          errorTalking();
        }),
      );
      return function () {
        subs.forEach((sub) => {
          if (sub && typeof sub.remove === "function") sub.remove();
        });
      };
    },
    [
      doneTalking,
      errorTalking,
      releaseAudioFocus,
      resumeRecognizer,
      startTalking,
    ],
  );
}
