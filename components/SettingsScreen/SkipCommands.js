import { memo, useState } from "react";
import { Switch, View } from "react-native";

import { Colors } from "../../constants/colors";
import { useSettingsData } from "../../context/VoiceRecognizerContext";
import useSettingsFunctions from "../../hooks/SettingsScreen/useSettingsFunctions";
import useSettingsStyles from "../../hooks/SettingsScreen/useSettingsStyles";
import { ExpandableSetting } from "../../ui/ExpandableSetting";

export default memo(function SkipCommands() {
  const { setting, settingLabel, switchBox, settingDescription } =
    useSettingsStyles();
  const { isSkipCommandsEnabledRef } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();

  const [isSkipCommandsEnabled, setIsSkipCommandsEnabled] = useState(
    isSkipCommandsEnabledRef.current,
  );

  return (
    <View style={[switchBox, setting]}>
      <ExpandableSetting
        label='Enable skip commands'
        labelStyle={settingLabel}
        descriptionStyle={settingDescription}
        description={`When disabled, "skip next" and "skip back" voice commands will be ignored.`}
      />

      <Switch
        value={isSkipCommandsEnabled}
        onValueChange={(value) => {
          setIsSkipCommandsEnabled(value);
          isSkipCommandsEnabledRef.current = value;
          updateSettingsInStorage("isSkipCommandsEnabled", value);
        }}
        thumbColor={Colors.primaryTint90}
        trackColor={{
          true: Colors.primaryTint40,
        }}
      />
    </View>
  );
});
