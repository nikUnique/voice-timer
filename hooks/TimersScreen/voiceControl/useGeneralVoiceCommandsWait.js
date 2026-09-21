import { VolumeManager } from "react-native-volume-manager";

import { useEffect } from "react";
import { NativeModules } from "react-native";

import {
  useContactsData,
  useRecognizerData,
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { CALL_TIMEOUT, RING_TIMEOUT } from "../../../utils/config";
import { resetTimerEmitter } from "../../../utils/EventEmitter";
import {
  formatRingingResetSpeech,
  formatStatusSpeech,
  getTimePhrase,
  normalize,
} from "../../../utils/helpers";
import { callNumber, endCall } from "../../../utils/nativeHelpers";
import { getSharedObject } from "../../../utils/sharedVariables";
import { useControlledVolume } from "../../shared/useControlledVolume";
import { useSound } from "../../shared/useSound";
import { useSpeak } from "../../shared/useSpeak";

let callTimeout, callId;
export function useGeneralVoiceCommands({ pauseMedia, resumeMedia }) {
  const { recognizedTime, alertingTimerNamesRef } = useRecognizerData();
  const {
    secretIdentifierRef,
    recognizedCommandRef,
    prevRecognizedCommandRef,
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
    SKIP_NEXT,
    SKIP_PREVIOUS,
    CALL,
    RING,
    YES,
    NO,
  } = commandsRef?.current ? commandsRef.current : {};

  const {
    successSound,
    discoSound,
    isHeadsetBroken,
    isSkipCommandsEnabledRef,
    isVoiceFeedbackEnabled,
  } = useSettingsData();

  const { contacts } = useContactsData();

  const { playSoundGeneral, playSpecial } = useSound();

  const { adjustVolumeFromApp } = useControlledVolume();

  useEffect(
    function () {
      async function load() {
        isMediaPlayingRef.current =
          await NativeModules.AudioFocusModule.isMediaPlaying();
        if (isMediaPlayingRef.current) {
          if (recognizedCommandRef.current?.includes(STOP_MEDIA)) {
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
          recognizedCommandRef.current?.includes(SKIP_NEXT) &&
          isMediaPlayingRef.current &&
          isSkipCommandsEnabledRef.current
        ) {
          NativeModules.NativeUtilsModule.skipNext();
          speak("Next");
        }

        if (
          recognizedCommandRef.current?.includes(SKIP_PREVIOUS) &&
          isMediaPlayingRef.current &&
          isSkipCommandsEnabledRef.current
        ) {
          NativeModules.NativeUtilsModule.skipPrevious();
          speak("Previous");
        }

        if (
          isMediaPlayingRef.current &&
          !recognizedCommandRef.current?.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current?.includes(ANSWER_CALL)
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
            ?.includes(PLAY_MEDIA) &&
          PLAY_MEDIA &&
          !isMediaPlayingRef.current
        ) {
          if (!isHeadsetBroken) {
            await resumeMedia();
            await NativeModules.NativeUtilsModule.pressHeadsetButton();
          }
          if (isHeadsetBroken) {
            await resumeMedia();
          }
        }

        if (
          recognizedCommandRef.current &&
          recognizedCommandRef.current
            .trim()
            .toLowerCase()
            ?.includes(ANSWER_CALL.toLowerCase())
        ) {
          NativeModules.NativeUtilsModule.answerCall();
        }

        if (
          isTimerSleepingRef.current &&
          recognizedCommandRef.current &&
          !recognizedCommandRef.current?.includes(TIMER_WAKE_UP) &&
          !recognizedCommandRef.current?.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current?.trim().toLowerCase().includes(STOP)
        ) {
          recognizedCommandRef.current = null;
          return;
        }

        clearTimeout(callTimeout);
        if (
          (recognizedCommandRef.current?.includes(`${CALL}`) ||
            recognizedCommandRef.current?.includes(`${RING}`)) &&
          !prevRecognizedCommandRef.current?.includes(`${CALL}`) &&
          !prevRecognizedCommandRef.current?.includes(`${RING}`) &&
          isVoiceFeedbackEnabled
        ) {
          const contactToCall = contacts.find((contact) =>
            recognizedCommandRef.current?.includes(normalize(contact.name)),
          );

          if (!contactToCall) {
            await speak("I didn't recognize that contact.");
            return;
          }

          const action = recognizedCommandRef.current?.includes(`${RING}`)
            ? "ring"
            : "call";

          console.log(contactToCall);
          await speak(
            `Are you sure you want to ${action} ${contactToCall.name}?`,
          );

          callTimeout = setTimeout(async function () {
            prevRecognizedCommandRef.current = null;
            await speak("Never mind, didn't hear you in time.");
          }, CALL_TIMEOUT);

          prevRecognizedCommandRef.current = recognizedCommandRef.current;
          return;
        }

        console.log(prevRecognizedCommandRef.current, "previous command");

        if (
          recognizedCommandRef.current?.includes(YES) &&
          (prevRecognizedCommandRef.current?.includes(`${CALL}`) ||
            prevRecognizedCommandRef.current?.includes(`${RING}`)) &&
          isVoiceFeedbackEnabled
        ) {
          clearTimeout(callTimeout);

          const contactToCall = contacts.find((contact) =>
            prevRecognizedCommandRef.current?.includes(normalize(contact.name)),
          );

          if (!contactToCall) {
            prevRecognizedCommandRef.current = null;
            await speak("I lost track of who to call.");
            return;
          }

          const confirmsName = recognizedCommandRef.current?.includes(
            normalize(contactToCall.name),
          );

          if (!confirmsName) {
            prevRecognizedCommandRef.current = null;
            await speak("Okay, cancelled.");
            return;
          }

          const wasRING = prevRecognizedCommandRef.current?.includes(`${RING}`);
          const action = wasRING ? "Ringing" : "Calling";

          console.log(contactToCall);
          await speak(`${action} ${contactToCall.name}.`);
          callNumber(contactToCall.phoneNumber);

          clearTimeout(callId);
          if (wasRING) {
            callId = setTimeout(function () {
              endCall();
            }, RING_TIMEOUT);
          }

          prevRecognizedCommandRef.current = null;
          return;
        }

        if (
          recognizedCommandRef.current?.includes(NO) &&
          (prevRecognizedCommandRef.current?.includes(`${CALL}`) ||
            prevRecognizedCommandRef.current?.includes(`${RING}`))
        ) {
          clearTimeout(callTimeout);
          prevRecognizedCommandRef.current = null;
          await speak(`Okay, cancelled.`);
          return;
        }

        prevRecognizedCommandRef.current = recognizedCommandRef.current;

        if (
          recognizedCommandRef.current?.includes(TIMER_GO_SLEEP) &&
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
          recognizedCommandRef.current?.includes(TIMER_WAKE_UP) &&
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
        if (recognizedCommandRef.current?.includes(VOLUME_UP)) {
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

        if (recognizedCommandRef.current?.includes(VOLUME_DOWN)) {
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

          speak(formatRingingResetSpeech(alertingTimerNamesRef.current));

          alertingTimerNamesRef?.current?.map((alertingTimer) =>
            resetTimerEmitter.emit(`${STOP} ${alertingTimer}`),
          );
        }

        const words = recognizedCommandRef.current?.split(" ").map(normalize);

        if (words?.includes(TIME) && TIME) {
          speak(getTimePhrase());
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
          );
        }

        recognizedCommandRef.current = null;
      }

      load().catch((error) => {
        console.error("useGeneralVoiceCommands load() failed:", error);
      });
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
      SKIP_NEXT,
      SKIP_PREVIOUS,
      CALL,
      prevRecognizedCommandRef,
      contacts,
      YES,
      NO,
      isSkipCommandsEnabledRef,
      RING,
      isVoiceFeedbackEnabled,
    ],
  );
}
