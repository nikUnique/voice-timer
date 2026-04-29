import { Text, View } from "react-native";

import Slider from "@react-native-community/slider";
import { Colors } from "../constants/colors";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import useSettingsStyles from "../hooks/useSettingsStyles";

export default function Sound() {
  const { settingPart, setting, heading, settingLabel, slider } =
    useSettingsStyles();
  const { alarmVolume, setAlarmVolume } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();

  return (
    <View style={settingPart}>
      <Text style={heading}>Sound</Text>

      <View style={setting}>
        <Text style={[settingLabel, setting]}>
          Alarm Volume: {Math.round(alarmVolume * 100)}%
        </Text>

        <Slider
          value={alarmVolume}
          onSlidingComplete={(value) => {
            setAlarmVolume(Math.round(value * 100) / 100);
            updateSettingsInStorage("alarmVolume", value);
          }}
          step={0.01}
          minimumValue={0.01}
          maximumValue={1}
          minimumTrackTintColor={Colors.primaryTint90}
          maximumTrackTintColor={Colors.primaryTint90}
          thumbTintColor={Colors.primaryTint90}
          style={slider}
        />
      </View>
    </View>
  );
}
