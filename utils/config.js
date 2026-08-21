export const MAX_HISTORY = 300;
export const DIM_PERCENTAGE = 0;
export const DIM_TIMEOUT = 60;
export const BACKGROUND_DELAY = 10800;
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
