import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Colors } from "../constants/colors";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { useResponsive } from "../hooks/useResponsive";
import { Text } from "../ui/AppText";
import IconButton from "../ui/IconButton";
import Time from "./Time";

export default memo(function TimerInterfaceUI({
  timerHeight,
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
  const { timers } = useRefsData();
  const { t } = useResponsive();
  const nameText = {
    fontWeight: 600,
    fontSize: t.title,
    color: Colors.primaryTint90,
    textAlign: "center",
  };

  const ui = (
    <View
      style={[
        styles.container,
        {
          minHeight: timerHeight,
        },

        !timerHeight && styles.hiddenTimer,
      ]}
    >
      <Text style={styles.paginationLabel}>
        {index + 1 + "/" + timers.length}
      </Text>

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
                size={36}
                icon='refresh-outline'
                color={Colors.primaryTint90}
                onPress={resetTimerRef.current}
                style={styles.refreshButton}
              />
            </View>
            {!isActive && timeLeftRef.current <= 0 && (
              <View>
                <IconButton
                  size={36}
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
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginBottom: 48,
  },

  hiddenTimer: {
    opacity: 0,
    pointerEvents: "none",
  },

  paginationLabel: {
    color: Colors.grayShade30,
    position: "absolute",
    top: 15,
    right: 15,
    textAlign: "right",
  },

  timerLabel: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  refreshButton: {
    borderRadius: "50%",
    padding: 24,
    backgroundColor: Colors.whiteAlpha20,
  },

  resetHiddenButton: {
    pointerEvents: "none",
    backgroundColor: Colors.whiteAlpha10,
  },

  resetButton: {
    borderRadius: "50%",
    padding: 24,
    backgroundColor: Colors.whiteAlpha20,
  },

  disabled: {
    opacity: 0.5,
  },
});
