import notifee, { AndroidImportance } from "@notifee/react-native";

export function registerChannelsAndService() {
  // Ensure the channel exists
  async function prepareChannel() {
    // await notifee.deleteChannel("full-screen-channel");
    await notifee.createChannel({
      id: "full-screen-channel",
      name: "Channel with custom sound",
      vibration: false,
      bypassDnd: true,
      importance: AndroidImportance.HIGH,
    });
  }

  prepareChannel();

  async function prepareSecondChannel() {
    await notifee.createChannel({
      id: "non-pop-up-notification-channel",
      name: "Channel without pop-up notification",
      vibration: false,
      bypassDnd: true,
      importance: AndroidImportance.HIGH,
    });
  }

  prepareSecondChannel();

  // notifee.deleteChannel("non-pop-up-notification-channel");

  // Ensure the channel exists
  async function loadChannel() {
    await notifee.createChannel({
      id: "channel-with-silent-mode",
      name: "Channel with silent mode",
      importance: AndroidImportance.LOW,
      vibration: false,
    });
  }

  loadChannel();

  // notifee.registerForegroundService(async () => {
  //   updateSharedObject({ isTaskRunning: true });
  //   while (getSharedObject().isTaskRunning) {
  //     console.log("Foreground service is running...");

  //     if (!getSharedObject().isTaskRunning) return;
  //     await sleep(getSharedObject().foregroundTaskDelay);
  //   }
  // });
}
