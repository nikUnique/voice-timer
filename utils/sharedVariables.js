let sharedObject = {
  timersLabel: "",
  isTaskRunning: false,
  alertingTimerNames: [],
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
