import { Colors } from "../constants/colors";
import { useResponsive } from "./useResponsive";

export default function useSettingsStyles() {
  const { t } = useResponsive();
  const settingPart = {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryTint70,
    borderStyle: "dotted",
    padding: 8,
  };
  const setting = {
    marginBottom: 16,
  };

  const heading = {
    fontSize: t.heading,
    fontWeight: "bold",
    marginBottom: 32,
    color: Colors.primaryTint90,
    marginTop: 16,
  };

  const settingLabel = {
    color: Colors.primaryTint90,
    fontSize: t.subheading,
    width: "90%",
  };

  return { settingPart, setting, heading, settingLabel };
}
