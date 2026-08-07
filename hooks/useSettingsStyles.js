import { useMemo } from "react";
import { Colors } from "../constants/colors";
import { useResponsive } from "./useResponsive";

export default function useSettingsStyles() {
  const { t } = useResponsive();
  const settingSection = useMemo(
    () => ({
      borderBottomWidth: 1,
      borderBottomColor: Colors.primaryTint70,
      // borderStyle: "",
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
      fontSize: t.heading,
      fontWeight: "bold",
      marginBottom: 32,
      color: Colors.primaryTint90,
      marginTop: 16,
    }),
    [t.heading],
  );

  const settingLabel = useMemo(
    () => ({
      color: Colors.primaryTint90,
      fontSize: t.subheading,
      width: "90%",
      // marginBottom: 12,
    }),
    [t.subheading],
  );

  const settingDescription = useMemo(
    () => ({
      color: Colors.primaryTint70,
      fontSize: t.body,
      width: "90%",
      marginBottom: 8,
    }),
    [t.body],
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
