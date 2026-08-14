import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";
import useSettingsStyles from "../../hooks/SettingsScreen/useSettingsStyles";
import { openNotificationChannelSettings } from "../../utils/helpers";

export default memo(function Notifications() {
  const { settingSection, setting, heading, settingBtn } = useSettingsStyles();

  const notificationText = {
    color: Colors.primaryTint90,
    fontSize: FONT.subheading,
  };

  return (
    <View style={[settingSection, styles.lastSettingPart, setting]}>
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
});

const styles = StyleSheet.create({
  lastSettingPart: {
    borderBottomWidth: 0,
  },
});
