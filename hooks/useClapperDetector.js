import { Audio } from "expo-av";
import { useRef, useCallback } from "react";

const CLAP_DB_THRESHOLD = -15; // tune this - claps spike sharply above ambient noise
const CLAP_COOLDOWN_MS = 400; // ignore repeat triggers right after a clap

export function useClapDetector(onClap) {
  const recordingRef = useRef(null);
  const lastClapRef = useRef(0);

  const start = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.LOW_QUALITY,
      isMeteringEnabled: true,
    });
    recording.setProgressUpdateInterval(80); // ms - tighter than default so the spike isn't missed

    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording || status.metering === undefined) return;

      const now = Date.now();
      if (
        status.metering > CLAP_DB_THRESHOLD &&
        now - lastClapRef.current > CLAP_COOLDOWN_MS
      ) {
        lastClapRef.current = now;
        onClap();
      }
    });

    await recording.startAsync();
    recordingRef.current = recording;
  }, [onClap]);

  const stop = useCallback(async () => {
    await recordingRef.current?.stopAndUnloadAsync();
    recordingRef.current = null;
  }, []);

  return { start, stop };
}
