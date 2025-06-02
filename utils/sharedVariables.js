let sharedObject = {
  timersLabel: "",
  delay: 1,
  foregroundTaskDelay: 900,
  appStateBox: "",
  isTaskRunning: false,
  alertingTimers: [],
  index: 0,
  notificationTap: false,
  timerListHeight: 0,
  resetAllFinishedFromApp: false,
  changeTimerNameParams: {},
  runningTimers: [],
  pausedTimers: [],
};

export function getSharedObject() {
  return { ...sharedObject };
}

export function updateSharedObject(newData) {
  try {
    sharedObject = { ...sharedObject, ...newData };

    return { ...sharedObject, ...newData };
  } catch (error) {
    console.error(`An error occured 💣`, error);
  }
}
