let sharedObject = {
  timersLabel: "",
  isTaskRunning: false,
  notificationTap: false,
  resetAllFinishedFromApp: false,
  changeTimerNameParams: {},
  alertingTimerNames: [],
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
