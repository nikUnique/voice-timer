import { memo, useState } from "react";
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Switch,
  View,
} from "react-native";

import { Colors } from "../../constants/colors";
import { useSettingsData } from "../../context/VoiceRecognizerContext";
import useSettingsFunctions from "../../hooks/SettingsScreen/useSettingsFunctions";
import useSettingsStyles from "../../hooks/SettingsScreen/useSettingsStyles";
import { ExpandableSetting } from "../../ui/ExpandableSetting";

export default memo(function BluetoothHeadsetMic() {
  const { setting, settingLabel, switchBox, settingDescription } =
    useSettingsStyles();
  const { bluetoothHeadsetMicEnabledRef } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();

  const [enabled, setEnabled] = useState(
    bluetoothHeadsetMicEnabledRef.current,
  );

  return (
    <View style={[switchBox, setting]}>
      <ExpandableSetting
        label="Use Bluetooth headset microphone"
        labelStyle={settingLabel}
        descriptionStyle={settingDescription}
        description={`When enabled, the app will try to use a connected Bluetooth headset's microphone for voice commands. Requires the "Nearby devices" permission on Android 12+. Leave off to always use the phone microphone and avoid that permission prompt.`}
      />

      <Switch
        value={enabled}
        onValueChange={async (value) => {
          if (!value) {
            bluetoothHeadsetMicEnabledRef.current = false;
            setEnabled(false);
            updateSettingsInStorage("bluetoothHeadsetMicEnabled", false);
            return;
          }

          // Permission only needed on Android 12+.
          if (Platform.OS !== "android" || Platform.Version < 31) {
            bluetoothHeadsetMicEnabledRef.current = true;
            setEnabled(true);
            updateSettingsInStorage("bluetoothHeadsetMicEnabled", true);
            return;
          }

          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: "Bluetooth Permission",
              message: "Allow access to use your Bluetooth headset microphone",
              buttonPositive: "Allow",
              buttonNegative: "Deny",
            },
          );

          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            bluetoothHeadsetMicEnabledRef.current = true;
            setEnabled(true);
            updateSettingsInStorage("bluetoothHeadsetMicEnabled", true);
          } else {
            setEnabled(false);
            if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
              Alert.alert(
                "Permission required",
                "Please enable the Nearby devices permission in app settings to use a Bluetooth headset microphone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Open settings",
                    onPress: () => Linking.openSettings(),
                  },
                ],
              );
            }
          }
        }}
        thumbColor={Colors.primaryTint90}
        trackColor={{
          true: Colors.primaryTint40,
        }}
      />
    </View>
  );
});