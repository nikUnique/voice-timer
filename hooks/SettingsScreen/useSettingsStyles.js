import { useMemo } from "react";
import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";

export default function useSettingsStyles() {
  const settingSection = useMemo(
    () => ({
      borderBottomWidth: 1,
      borderBottomColor: Colors.primaryTint70,
      paddingHorizontal: 8,
    }),
    [],
  );

  const setting = useMemo(
    () => ({
      marginBottom: 16,
    }),
    [],
  );

  const dividerLine = useMemo(
    () => ({
      borderBottomWidth: 1,
      borderBottomColor: Colors.primaryTint70,
      borderStyle: "dotted",
      marginBottom: 16,
    }),
    [],
  );

  const heading = useMemo(
    () => ({
      fontSize: FONT.heading,
      fontWeight: "bold",
      marginBottom: 32,
      color: Colors.primaryTint90,
      marginTop: 16,
    }),
    [],
  );

  const settingLabel = useMemo(
    () => ({
      color: Colors.primaryTint90,
      fontSize: FONT.subheading,
      width: "90%",
    }),
    [],
  );

  const settingDescription = useMemo(
    () => ({
      color: Colors.primaryTint70,
      fontSize: FONT.body,
      width: "90%",
      marginBottom: 8,
    }),
    [],
  );

  const switchBox = useMemo(
    () => ({
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    }),
    [],
  );

  const settingBtn = useMemo(
    () => ({
      backgroundColor: Colors.whiteAlpha20,
      padding: 8,
      width: "100%",
      borderRadius: 8,
    }),
    [],
  );

  const slider = useMemo(
    () => ({
      marginLeft: -10,
      marginRight: -10,
      color: Colors.primaryTint90,
      flex: 1,
    }),
    [],
  );

  return {
    settingSection,
    setting,
    heading,
    settingLabel,
    settingDescription,
    settingBtn,
    switchBox,
    slider,
    dividerLine,
  };
}
