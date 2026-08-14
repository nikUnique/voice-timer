let sharedObject = {
  timersLabel: "",
  delay: 1,
  appStateBox: "",
  isTaskRunning: false,
  alertingTimerNames: [],
  index: 0,
  notificationTap: false,
  timerListHeight: 0,
  resetAllFinishedFromApp: false,
  changeTimerNameParams: {},
  runningTimerNames: [],
  pausedTimerNames: [],
  timers: [],
};

export function getSharedObject() {
  return { ...sharedObject };
}

export function updateSharedObject(newData) {
  try {
    sharedObject = { ...sharedObject, ...newData };

    return { ...sharedObject, ...newData };
  } catch (error) {
    console.error(`An error occurred 💣`, error);
  }
}
