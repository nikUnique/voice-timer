import { VolumeManager } from "react-native-volume-manager";

import { useEffect } from "react";
import { NativeModules } from "react-native";

import {
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { useSpeak } from "../../shared/useSpeak";
import { useSound } from "../../shared/useSound";
import {
  formatRingingResetSpeech,
  formatStatusSpeech,
  getTimePhrase,
  normalize,
} from "../../../utils/helpers";
import { resetTimerEmitter } from "../../../utils/EventEmitter";
import { getSharedObject } from "../../../utils/sharedVariables";
import { useControlledVolume } from "../../shared/useControlledVolume";

export function useGeneralVoiceCommands({ pauseMedia, resumeMedia }) {
  const { recognizedTime, alertingTimerNamesRef } = useRecognizerData();
  const {
    secretIdentifierRef,
    recognizedCommandRef,
    isMediaPausedRef,
    isMediaPlayingRef,
    isTimerSleepingRef,
    isListeningRef,
    isMediaPausedManuallyRef,
    commandsRef,
  } = useRefsData();

  const { speak } = useSpeak();
  const {
    STOP,
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
  } = commandsRef?.current ? commandsRef.current : {};

  const { successSound, discoSound, isHeadsetBroken } = useSettingsData();

  const { playSoundGeneral, playSpecial } = useSound();

  const { adjustVolumeFromApp } = useControlledVolume();

  useEffect(
    function () {
      async function load() {
        isMediaPlayingRef.current =
          await NativeModules.AudioFocusModule.isMediaPlaying();
        if (isMediaPlayingRef.current) {
          if (recognizedCommandRef.current.includes(STOP_MEDIA)) {
            if (!isHeadsetBroken) {
              await NativeModules.NativeUtilsModule.pressHeadsetButton();
              pauseMedia();
            }
            if (isHeadsetBroken) {
              NativeModules.AudioFocusModule.requestAudioFocus(
                async (granted) => {
                  if (granted) {
                    pauseMedia();
                  }
                },
              );
            }
          }
        }
        if (
          isMediaPlayingRef.current &&
          !recognizedCommandRef.current.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current.includes(ANSWER_CALL)
        ) {
          console.log(
            "Stop the background media first before using other voice commands",
          );
          recognizedCommandRef.current = null;
          return;
        }

        if (
          recognizedCommandRef.current
            ?.toLowerCase()
            .trim()
            .includes(PLAY_MEDIA) &&
          PLAY_MEDIA &&
          !isMediaPlayingRef.current
        ) {
          if (!isHeadsetBroken) {
            await resumeMedia();
            await NativeModules.NativeUtilsModule.pressHeadsetButton();
          }
          if (isHeadsetBroken) {
            NativeModules.AudioFocusModule.toggleMedia(async (shouldTake) => {
              await resumeMedia();
            });
          }
        }

        if (
          recognizedCommandRef.current &&
          recognizedCommandRef.current
            .trim()
            .toLowerCase()
            .includes(ANSWER_CALL.toLowerCase())
        ) {
          NativeModules.NativeUtilsModule.answerCall();
        }

        if (
          isTimerSleepingRef.current &&
          recognizedCommandRef.current &&
          !recognizedCommandRef.current.includes(TIMER_WAKE_UP) &&
          !recognizedCommandRef.current.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current.trim().toLowerCase().includes(STOP)
        ) {
          recognizedCommandRef.current = null;
          return;
        }

        if (
          recognizedCommandRef.current.includes(TIMER_GO_SLEEP) &&
          !isTimerSleepingRef.current
        ) {
          playSoundGeneral({
            fileName: successSound,
            shouldStop: false,
          });
          speak("Timer went to sleep");
          isTimerSleepingRef.current = true;
        }

        if (
          recognizedCommandRef.current.includes(TIMER_WAKE_UP) &&
          isTimerSleepingRef.current
        ) {
          playSoundGeneral({
            fileName: successSound,
            shouldStop: false,
          });
          speak("Timer ready");
          isTimerSleepingRef.current = false;
        }

        // Volume place
        if (recognizedCommandRef.current.includes(VOLUME_UP)) {
          const { volume } = await VolumeManager.getVolume("music");
          const percent = Math.round((volume + 0.1) * 10) / 10;

          if (percent <= 1) {
            adjustVolumeFromApp(percent);
            playSoundGeneral({
              fileName: successSound,
              shouldStop: false,
            });
            speak(`Volume ${percent * 100}`);
          }
        }

        if (recognizedCommandRef.current.includes(VOLUME_DOWN)) {
          const { volume } = await VolumeManager.getVolume("music");
          const percent = Math.round((volume - 0.1) * 10) / 10;

          adjustVolumeFromApp(percent);
          playSoundGeneral({
            fileName: successSound,
            shouldStop: false,
          });
          speak(`Volume ${percent * 100}`);
        }

        if (
          recognizedCommandRef.current
            ?.toLowerCase()
            .includes(
              `${STOP_FINISHED} ${secretIdentifierRef.current?.split(" ").slice(2, -1)}`.trim(),
            )
        ) {
          setTimeout(function () {
            playSoundGeneral({
              fileName: successSound,
              shouldStop: false,
            });
          }, 200);

          speak(formatRingingResetSpeech(alertingTimerNamesRef.current), 0.5);

          alertingTimerNamesRef?.current?.map((alertingTimer) =>
            resetTimerEmitter.emit(`${STOP} ${alertingTimer}`),
          );
        }

        const words = recognizedCommandRef.current?.split(" ").map(normalize);

        if (words.includes(TIME) && TIME) {
          speak(getTimePhrase(), 0.3);
        }

        if (
          recognizedCommandRef.current
            ?.toLowerCase()
            .trim()
            .includes(STATUS_REPORT) &&
          STATUS_REPORT
        ) {
          speak(
            formatStatusSpeech(
              getSharedObject().runningTimerNames,
              getSharedObject().pausedTimerNames,
              getSharedObject().alertingTimerNames,
            ),
            0.3,
          );
        }

        recognizedCommandRef.current = null;
      }

      load();
    },
    [
      ANSWER_CALL,
      DISCO,
      PLAY_MEDIA,
      STOP,
      STOP_FINISHED,
      STATUS_REPORT,
      STOP_MEDIA,
      TIME,
      TIMER_GO_SLEEP,
      TIMER_WAKE_UP,
      VOLUME_DOWN,
      VOLUME_UP,
      alertingTimerNamesRef,
      discoSound,
      isListeningRef,
      isMediaPausedManuallyRef,
      isMediaPausedRef,
      isMediaPlayingRef,
      isTimerSleepingRef,
      playSoundGeneral,
      playSpecial,
      recognizedCommandRef,
      recognizedTime,
      secretIdentifierRef,
      speak,
      successSound,
      isHeadsetBroken,
      pauseMedia,
      resumeMedia,
      adjustVolumeFromApp,
    ],
  );
}
