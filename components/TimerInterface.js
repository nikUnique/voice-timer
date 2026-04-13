import { memo, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useExecuteCommand } from "../hooks/useExecuteCommand";
import { useLoadTimerState } from "../hooks/useLoadTimerState";
import { usePauseResume } from "../hooks/usePauseResume";
import { usePrepareEffects } from "../hooks/usePrepareEffects";
import { useResetTimer } from "../hooks/useResetTimer";
import { useSaveStorage } from "../hooks/useSaveStorage";
import { useStartTimer } from "../hooks/useStartTimer";
import { useTimerInterfaceFunctions } from "../hooks/useTimerInterfaceFunctions";
import { useTimerInterfaceState } from "../hooks/useTimerInterfaceState";
import { useTimeUpdate } from "../hooks/useTimeUpdate";
import { useUpdateLeastTimer } from "../hooks/useUpdateLeastTimer";
import { useUpdateNotification } from "../hooks/useUpdateNotification";
import IconButton from "../ui/IconButton";

import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/colors";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { emitter } from "../utils/EventEmitter";
import { updateSharedObject } from "../utils/sharedVariables";
import Time from "./Time";

function TimerInterface({
  time = 1200,
  name,
  index,
  recognizedCommand,
  lastCommandRef,
  clearCommand,
  activateTimerRef,
  handleReadyState,
  onDelete,
  timerHeight,
}) {
  const navigation = useNavigation();
  const [setModalIsVisible] = useState(false);

  const timerInterfaceState = useTimerInterfaceState({ time });

  const { timers } = useRefsData();

  const allState = {
    name,
    index,
    time,
    recognizedCommand,
    lastCommandRef,
    clearCommand,
    activateTimerRef,
    handleReadyState,
    ...timerInterfaceState,
  };

  const { timeLeftRef, isActive, isPaused, setIsActive, resetTimerRef } =
    allState;

  const { updateLeastTimer } = useUpdateLeastTimer({
    name,
    index,
    ...allState,
  });

  console.log("Timer name", name);

  const { loadTimerState } = useLoadTimerState(allState);
  const { saveStorage } = useSaveStorage(allState);

  const { pauseListener, updatePersitentNotification, updateTimerLabel } =
    useUpdateNotification({
      ...allState,
      updateLeastTimer,
    });

  const { updateTime } = useTimeUpdate({
    ...allState,
    updateLeastTimer,
    updateTimerLabel,
  });

  usePrepareEffects({
    ...allState,
    saveStorage,
    loadTimerState,
    pauseListener,
    updatePersitentNotification,
    index,
    activateTimerRef,
  });

  usePauseResume({
    ...allState,
    pauseListener,
    updateTime,
    updateTimerLabel,
    updatePersitentNotification,
  });

  useResetTimer({
    ...allState,
    updateTimerLabel,
  });

  const { startTimer } = useStartTimer({
    ...allState,
    updateLeastTimer,
    updatePersitentNotification,
    updateTimerLabel,
    pauseListener,
    updateTime,
  });

  const { executeCommand } = useExecuteCommand({
    ...allState,
    startTimer,
  });

  useEffect(
    function () {
      executeCommand();
    },
    [recognizedCommand, lastCommandRef, executeCommand],
  );

  const { controlTimer, startChangeNameHandler } = useTimerInterfaceFunctions({
    ...allState,
    startTimer,
    setModalIsVisible,
    handleReadyState,
  });

  useEffect(
    function () {
      emitter.all.delete(`timerSelected-${index}`);
      emitter.on(`timerSelected-${index}`, () => {
        updateSharedObject({
          isActive,
          isPaused,
          name,
        });
      });

      return () => {
        emitter.all.delete(`timerSelected-${index}`);
      };
    },
    [controlTimer, index, isActive, isPaused, name, onDelete, startTimer],
  );

  useEffect(
    function () {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: isActive ? Colors.primaryTint8 : Colors.primary,
        },
      });
    },
    [isActive, navigation],
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: timerHeight,
        },

        isActive && { backgroundColor: Colors.primaryTint8 },
        !timerHeight && styles.hiddenTimer,
      ]}
    >
      <Text style={styles.paginationLabel}>
        {index + 1 + "/" + timers.length}
      </Text>
      <Pressable
        onPress={!isActive ? startChangeNameHandler : () => {}}
        style={styles.timerLabel}
      >
        <Text style={styles.name}>{name}</Text>

        <IconButton
          icon='create'
          size={24}
          color={Colors.primaryTint90}
          onPress={!isActive ? startChangeNameHandler : () => {}}
          style={isActive && styles.disabled}
        />
      </Pressable>

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

      {
        <View style={(!isPaused || !isActive) && styles.hiddenTimer}>
          <IconButton
            size={36}
            icon='refresh-outline'
            color={Colors.primaryTint90}
            onPress={resetTimerRef.current}
            style={styles.refreshButton}
          />
        </View>
      }
      <View>
        {!isActive && timeLeftRef.current <= 0 && (
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryShade30,
    padding: 20,
    zIndex: -1,
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
  },

  timerLabel: {
    position: "absolute",
    bottom: "67%",
    textAlign: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  name: {
    fontWeight: 600,
    fontSize: 24,
    color: Colors.primaryTint90,
  },

  refreshButton: {
    borderRadius: "50%",
    padding: 24,
    backgroundColor: Colors.whiteAlpha20,
  },

  resetButton: {
    borderRadius: "50%",
    padding: 24,
    backgroundColor: Colors.whiteAlpha20,
    position: "absolute",
    bottom: "-50%",
    left: "50%",
    transform: "translate(-50%, 0)",
  },

  resetHiddenButton: {
    pointerEvents: "none",
    backgroundColor: "rgba(255, 255, 255, 0)",
  },

  disabled: {
    opacity: 0.5,
  },
});

export default memo(TimerInterface);
