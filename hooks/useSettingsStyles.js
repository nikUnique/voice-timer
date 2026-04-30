import { useMemo } from "react";
import { Colors } from "../constants/colors";
import { useResponsive } from "./useResponsive";

export default function useSettingsStyles() {
  const { t } = useResponsive();
  const settingPart = useMemo(
    () => ({
      borderBottomWidth: 1,
      borderBottomColor: Colors.primaryTint70,
      borderStyle: "dotted",
      padding: 8,
    }),
    [],
  );

  const setting = useMemo(
    () => ({
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
    }),
    [t.subheading],
  );

  const switchBox = useMemo(
    () => ({
      flexDirection: "row",
      alignItems: "center",
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
    settingPart,
    setting,
    heading,
    settingLabel,
    settingBtn,
    switchBox,
    slider,
  };
}
