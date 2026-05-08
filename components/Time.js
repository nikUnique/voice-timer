import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Text } from "react-native";
import { Colors } from "../constants/colors";
import { useRefsData } from "../context/VoiceRecognizerContext";
import { useSpeak } from "../hooks/useSpeak";
import { emitter } from "../utils/EventEmitter";
import { formatTime } from "../utils/helpers";

export default function Time({
  time,
  name,
  activateTimerRef,
  index,
  setIsActive,
  isPaused,
  isActive,
}) {
  const [timeLeft, setTimeLeft] = useState(time);
  const fadeAnimationRefCur = useRef(new Animated.Value(1)).current;

  const { speak } = useSpeak();
  const { currentlyViewedItemRef } = useRefsData();

  Time[`timeLeft${name}`] = timeLeft;
  Time[`setTimeLeft-${name}`] = setTimeLeft;

  const moreThenHour = timeLeft / 3600 >= 1;

  const fadeInAndOut = useCallback(
    function () {
      fadeAnimationRefCur.stopAnimation();
      fadeAnimationRefCur.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnimationRefCur, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimationRefCur, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [fadeAnimationRefCur],
  );

  useEffect(
    function () {
      let animationInterval;
      if (isPaused && isActive) {
        animationInterval = setInterval(function () {
          fadeInAndOut();
        }, 1000);
      }

      if (!isPaused || !isActive) {
        clearInterval(animationInterval);

        fadeAnimationRefCur.stopAnimation(() =>
          fadeAnimationRefCur.setValue(1),
        );
      }

      return () => clearInterval(animationInterval);
    },
    [fadeAnimationRefCur, fadeInAndOut, isPaused, isActive],
  );

  useEffect(
    function () {
      async function endOfTimer() {
        if (timeLeft <= 0) {
          setIsActive(false);
        }
      }
      endOfTimer();
      emitter.emit(`timeItem-${name}`, timeLeft);
    },
    [
      timeLeft,
      activateTimerRef,
      index,
      setIsActive,
      currentlyViewedItemRef,
      name,
      speak,
      time,
    ],
  );

  return (
    <Animated.View style={{ opacity: fadeAnimationRefCur }}>
      <Text
        style={[
          {
            fontSize: 52,
            fontWeight: "bold",
            color: Colors.primaryTint90,
          },
          moreThenHour && {
            fontSize: 52,
          },
        ]}
      >
        {formatTime(timeLeft)}
      </Text>
    </Animated.View>
  );
}
