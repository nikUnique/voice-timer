import { useMemo } from "react";
import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";
import { SPACE } from "../../constants/spacing";
import { RADIUS } from "../../constants/radius";

export default function useSettingsStyles() {
  const settingSection = useMemo(
    () => ({
      borderBottomWidth: 1,
      borderBottomColor: Colors.primaryTint70,
      paddingHorizontal: SPACE.md,
      marginBottom: SPACE.xxxl,
    }),
    [],
  );

  const setting = useMemo(
    () => ({
      marginBottom: SPACE.xxxl,
    }),
    [],
  );

  const dividerLine = useMemo(
    () => ({
      borderBottomWidth: 1,
      borderBottomColor: Colors.primaryTint70,
      borderStyle: "dotted",
      marginBottom: SPACE.xxxl,
    }),
    [],
  );

  const heading = useMemo(
    () => ({
      fontSize: FONT.heading,
      fontWeight: "bold",
      marginBottom: SPACE.xxxl,
      color: Colors.primaryTint90,
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
      marginBottom: SPACE.md,
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
      padding: SPACE.md,
      width: "100%",
      borderRadius: RADIUS.chip,
    }),
    [],
  );

  const slider = useMemo(
    () => ({
      marginLeft: -SPACE.md,
      marginRight: -SPACE.md,
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
