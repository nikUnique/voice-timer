import { useEffect, useLayoutEffect, useRef } from "react";

import {
  useRecognizerData,
  useRefsData,
} from "../../../context/VoiceRecognizerContext";

import { useAlarmResetCommand } from "./useAlarmResetCommand";
import { useCallConfirmationFlow } from "./useCallConfirmationFlow";
import { useMediaCommands } from "./useMediaCommands";
import { useReportCommands } from "./useReportCommands";
import { useTimerSleepBlocking } from "./useTimerSleepBlocking";
import { useTimerSleepCommands } from "./useTimerSleepCommands";
import { useVolumeCommands } from "./useVolumeCommands";

export function useGeneralVoiceCommands({ pauseMedia, resumeMedia }) {
  const { recognizedTime } = useRecognizerData();
  const {
    recognizedCommandRef,
    prevRecognizedCommandRef,
    isMediaPlayingRef,
    isTimerSleepingRef,
    commandsRef,
  } = useRefsData();

  const commands = commandsRef?.current ?? {};
  const { STOP, STOP_MEDIA, TIMER_WAKE_UP, ANSWER_CALL } = commands;

  const { isTimerSleepBlocking } = useTimerSleepBlocking();

  const media = useMediaCommands({
    pauseMedia,
    resumeMedia,
  });

  const callFlow = useCallConfirmationFlow();

  const volume = useVolumeCommands();

  const timerSleep = useTimerSleepCommands();

  const alarmReset = useAlarmResetCommand();

  const report = useReportCommands();

  const latestRef = useRef(null);

  useLayoutEffect(function syncLatest() {
    latestRef.current = {
      isTimerSleepBlocking,
      media,
      callFlow,
      volume,
      timerSleep,
      alarmReset,
      report,
    };
  });

  useEffect(
    function () {
      async function load() {
        const {
          isTimerSleepBlocking,
          media,
          callFlow,
          volume,
          timerSleep,
          alarmReset,
          report,
        } = latestRef.current;

        await media.refreshMediaState();
        await media.handleStopMedia();

        media.handleSkip();

        if (
          isMediaPlayingRef.current &&
          !recognizedCommandRef.current?.includes(STOP_MEDIA) &&
          !recognizedCommandRef.current?.includes(ANSWER_CALL)
        ) {
          recognizedCommandRef.current = null;
          return;
        }

        await media.handlePlayMedia();
        media.handleAnswerCall();
        alarmReset.handleResetAlarm();

        if (isTimerSleepBlocking()) {
          recognizedCommandRef.current = null;
          return;
        }

        if (await callFlow.handleYes()) return;
        if (await callFlow.handleNo()) return;
        if (await callFlow.startConfirmation()) return;

        prevRecognizedCommandRef.current = recognizedCommandRef.current;

        timerSleep.handleGoSleep();
        timerSleep.handleWakeUp();
        await volume.handleVolumeUp();
        await volume.handleVolumeDown();
        report.handleTimeReport();
        report.handleStatusReport();

        recognizedCommandRef.current = null;
      }

      load().catch((error) => {
        console.error("useGeneralVoiceCommands load() failed:", error);
      });
    },
    [
      ANSWER_CALL,
      STOP,
      STOP_MEDIA,
      TIMER_WAKE_UP,
      isMediaPlayingRef,
      isTimerSleepingRef,
      prevRecognizedCommandRef,
      recognizedCommandRef,
      recognizedTime,
    ],
  );
}
