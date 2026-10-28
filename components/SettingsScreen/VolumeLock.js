import { memo } from "react";
import { Platform, Switch, UIManager, View } from "react-native";

import { Colors } from "../../constants/colors";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import useSettingsFunctions from "../../hooks/SettingsScreen/useSettingsFunctions";
import useSettingsStyles from "../../hooks/SettingsScreen/useSettingsStyles";
import { ExpandableSetting } from "../../ui/ExpandableSetting";

export default memo(function VolumeLock() {
  const { setting, settingLabel, switchBox, settingDescription } =
    useSettingsStyles();
  const { isVolumeLocked, setIsVolumeLocked } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  const { commandsRef } = useRefsData();

  const { VOLUME_UP, VOLUME_DOWN } = commandsRef?.current
    ? commandsRef.current
    : {};

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <View style={[switchBox, setting]}>
      <ExpandableSetting
        label="Lock media volume"
        labelStyle={settingLabel}
        descriptionStyle={settingDescription}
        description={`Blocks physical media-volume changes (e.g. from a misfiring headset or accidental button presses). Phone volume buttons won't change media volume while this is on. You can still change media volume using the "${VOLUME_UP}" and "${VOLUME_DOWN}" commands.`}
      />

      <Switch
        value={isVolumeLocked}
        onValueChange={(value) => {
          setIsVolumeLocked(value);
          updateSettingsInStorage("isVolumeLocked", value);
        }}
        thumbColor={Colors.primaryTint90}
        trackColor={{
          true: Colors.primaryTint40,
        }}
      />
    </View>
  );
});
