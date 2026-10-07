import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Colors } from "../../constants/colors";
import { FONT } from "../../constants/typography";
import { Text } from "../../ui/AppText";
import IconButton from "../../ui/IconButton";
import Time from "./Time";
import { WEIGHT } from "../../constants/weight";
import { SPACE } from "../../constants/spacing";

export default memo(function TimerInterfaceUI({
  index,
  isActive,
  startChangeNameHandler,
  name,
  time,
  activateTimerRef,
  setIsActive,
  startTimer,
  isPaused,
  resetTimerRef,
  timeLeftRef,
}) {
  const nameText = {
    fontWeight: WEIGHT.semibold,
    fontSize: FONT.title,
    color: Colors.primaryTint90,
    textAlign: "center",
  };

  const ui = (
    <View style={styles.container}>
      <View style={styles.centerItems}>
        <Pressable
          onPress={!isActive ? startChangeNameHandler : () => {}}
          style={styles.timerLabel}
        >
          <Text style={nameText}>{name}</Text>

          <IconButton
            icon='create'
            size={24}
            color={Colors.primaryTint90}
            onPress={!isActive ? startChangeNameHandler : () => {}}
            style={isActive && styles.disabled}
          />
        </Pressable>

        {
          <Time
            time={time}
            activateTimerRef={activateTimerRef}
            index={index}
            setIsActive={setIsActive}
            name={name}
            startTimer={startTimer}
            isPaused={isPaused}
            isActive={isActive}
          />
        }

        {
          <>
            <View style={(!isPaused || !isActive) && styles.hiddenTimer}>
              <IconButton
                size={FONT.display}
                icon='refresh-outline'
                color={Colors.primaryTint90}
                onPress={resetTimerRef.current}
                style={styles.refreshButton}
              />
            </View>
            {!isActive && timeLeftRef.current <= 0 && (
              <View style={styles.resetWrapper}>
                <IconButton
                  size={FONT.display}
                  icon='stop'
                  color={Colors.primaryTint90}
                  onPress={resetTimerRef.current}
                  style={[
                    styles.resetButton,
                    (isPaused || isActive) && styles.resetHiddenButton,
                  ]}
                />
              </View>
            )}
          </>
        }
      </View>
    </View>
  );

  return ui;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryShade30,
    zIndex: -1,
  },

  centerItems: {
    marginBottom: SPACE.huge,
    alignItems: "center",
  },

  hiddenTimer: {
    opacity: 0,
    pointerEvents: "none",
  },

  timerLabel: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: SPACE.md,
  },

  refreshButton: {
    borderRadius: "50%",
    padding: SPACE.xxl,
    backgroundColor: Colors.whiteAlpha20,
    alignItems: "center",
    alignSelf: "center",
  },

  resetWrapper: {
    alignItems: "center",
  },

  resetHiddenButton: {
    pointerEvents: "none",
    backgroundColor: Colors.whiteAlpha10,
  },

  resetButton: {
    borderRadius: "50%",
    padding: SPACE.xxl,
    backgroundColor: Colors.whiteAlpha20,
    alignItems: "center",
    alignSelf: "center",
  },

  disabled: {
    opacity: 0.5,
  },
});
