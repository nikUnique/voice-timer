import { memo } from "react";
import { Platform, Switch, UIManager, View } from "react-native";

import { Colors } from "../../constants/colors";
import {
  useRefsData,
  useSettingsData,
} from "../../context/VoiceRecognizerContext";
import useSettingsFunctions from "../../hooks/useSettingsFunctions";
import useSettingsStyles from "../../hooks/useSettingsStyles";
import { ExpandableSetting } from "../../ui/ExpandableSetting";

export default memo(function BrokenMic() {
  const { setting, settingLabel, switchBox, settingDescription } =
    useSettingsStyles();
  const { isHeadsetBroken, setIsHeadsetBroken } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  const { commandsRef } = useRefsData();

  const { STOP_MEDIA, PLAY_MEDIA } = commandsRef?.current
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
        label='Ignore hardware media button events'
        labelStyle={settingLabel}
        descriptionStyle={settingDescription}
        description={`Useful if your headset's physical buttons are broken and misfiring, causing unwanted pause/resume.\n\nIf you also enabled a similar setting in your media app, turn this on too - the app will then pause/resume external media by requesting and releasing audio focus instead of sending button commands.\n\nNote: if this setting is on, and you paused media using "${STOP_MEDIA}", then fully closing or killing this app will cause the paused media to resume on its own. Also, you can resume with ${PLAY_MEDIA}, only if you paused using a command. Otherwise, you won't be able to resume with the "${PLAY_MEDIA}" command.`}
      />

      <Switch
        value={isHeadsetBroken}
        onValueChange={(value) => {
          setIsHeadsetBroken(value);
          updateSettingsInStorage("isHeadsetBroken", value);
        }}
        thumbColor={Colors.primaryTint90}
        trackColor={{
          true: Colors.primaryTint40,
        }}
      />
    </View>
  );
});
