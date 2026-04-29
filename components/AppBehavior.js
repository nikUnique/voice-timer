import { Switch, Text, View } from "react-native";
import useSettingsStyles from "../hooks/useSettingsStyles";
import { useSettingsData } from "../context/VoiceRecognizerContext";
import useSettingsFunctions from "../hooks/useSettingsFunctions";
import { Colors } from "../constants/colors";
import Slider from "@react-native-community/slider";

export default function AppBehavior() {
  const { settingPart, setting, heading, settingLabel, switchBox, slider } =
    useSettingsStyles();
  const {
    keepScreenOnCommand,
    setKeepScreenOnCommand,
    keepScreenOnMinutes,
    setKeepScreenOnMinutes,
  } = useSettingsData();
  const { updateSettingsInStorage } = useSettingsFunctions();
  return (
    <View style={settingPart}>
      <Text style={heading}>App Behavior</Text>

      <View style={[switchBox, setting]}>
        <Text style={settingLabel}>Keep Screen On After Voice Command</Text>

        <Switch
          value={keepScreenOnCommand}
          onValueChange={(value) => {
            setKeepScreenOnCommand(value);
            updateSettingsInStorage("keepScreenOnCommand", value);
          }}
          thumbColor={Colors.primaryTint90}
          trackColor={{
            true: Colors.primaryTint40,
          }}
        />
      </View>

      {keepScreenOnCommand && (
        <View style={setting}>
          <Text style={[settingLabel, setting]}>
            Keep Screen On For: {keepScreenOnMinutes} minute
            {keepScreenOnMinutes !== 1 ? "s" : ""}
          </Text>

          <Slider
            value={keepScreenOnMinutes}
            onSlidingComplete={(value) => {
              setKeepScreenOnMinutes(value);
              updateSettingsInStorage("keepScreenOnMinutes", value);
            }}
            step={1}
            minimumTrackTintColor={Colors.primaryTint90}
            maximumTrackTintColor={Colors.primaryTint90}
            thumbTintColor={Colors.primaryTint90}
            minimumValue={1}
            maximumValue={30}
            style={slider}
          />
        </View>
      )}
    </View>
  );
}
