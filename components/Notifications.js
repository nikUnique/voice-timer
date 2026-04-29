import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../constants/colors";
import { useResponsive } from "../hooks/useResponsive";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { openNotificationChannelSettings } from "../utils/helpers";

export default function Notifications() {
  const { settingPart, setting, heading, settingBtn } = useSettingsStyles();

  const { t } = useResponsive();

  const notificationText = {
    color: Colors.primaryTint90,
    fontSize: t.subheading,
  };
  return (
    <View style={[settingPart, styles.lastSettingPart, setting]}>
      <Text style={heading}>Notification Settings</Text>

      <Pressable
        onPress={async () => {
          openNotificationChannelSettings("RN_BACKGROUND_ACTIONS_CHANNEL");
        }}
      >
        <View style={[settingBtn, setting]}>
          <Text style={notificationText}>
            Hide Background Service Notification
          </Text>
        </View>
        <Text style={notificationText}>
          Why remove the notification? Because it is not useful at all, but it
          appears when the app is in the background and without the user&apos;s
          permission it cannot be removed. So, in the beginning after installing
          the app there will be 2 notifications by default.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  lastSettingPart: {
    borderBottomWidth: 0,
  },
});
