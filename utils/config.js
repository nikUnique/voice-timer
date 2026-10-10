export const MAX_HISTORY = 300;
export const DIM_PERCENTAGE = 0;
export const DIM_TIMEOUT = 60;
export const BACKGROUND_DELAY = 10800;
export const TTS_TIMEOUT = 10000;
export const CONTACT_LIMIT = 20;
export const CALL_TIMEOUT = 7000;
export const PHONE_TIMEOUT = 12000;
export const MINUTE_CALL_TIMEOUT = 60000;
export const BOOT_MIN_MS = 700;
export const BOOT_SAFETY_MS = 4000;
export const BOOT_FADE_MS = 400;
// How often the Commands screen re-checks external media playback while it
// is focused. External apps never pass through our handlers, so this poll is
// the only way the list learns media started or stopped.
export const COMMANDS_RUNTIME_POLL_MS = 5000;
// Seconds between the success chime and the spoken feedback for voice
// commands. The chime is the instant "I heard you" ack; the voice is the
// detail. A small gap keeps the two from overlapping. Tune on device.
export const SUCCESS_CHIME_GAP = 0.15;
export const VOICE_FEEDBACK_SPEEDS = [
  { label: "Slow", value: 0.3 },
  { label: "Normal", value: 0.5 },
  { label: "Fast", value: 0.8 },
  { label: "Super Fast", value: 1 },
];

export const options = {
  taskName: "Timer",
  taskTitle: "App is keeping your timer active",
  taskDesc: "Keeps your timer active. You can hide this notification.",
  taskIcon: {
    name: "ic_launcher_notification",
    type: "drawable",
  },
  color: "#edf2ff",
  linkingURI: "voice_timer://timer",
  foregroundServiceType: ["specialUse", "microphone"],
};
