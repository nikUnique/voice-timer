import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

import { Colors } from "../../constants/colors";
import { useRefsData } from "../../context/VoiceRecognizerContext";
import { useSpeak } from "../../hooks/shared/useSpeak";
import { Text } from "../../ui/AppText";
import { emitter } from "../../utils/EventEmitter";
import { formatTime } from "../../utils/helpers";
import { WEIGHT } from "../../constants/weight";

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
  const [fadeAnimation] = useState(() => new Animated.Value(1));
  const blinkActiveRef = useRef(false);
  const { currentlyViewedItemRef } = useRefsData();
  const { speak } = useSpeak();

  useEffect(
    function () {
      const key = `setTimeLeft-${name}`;
      Time[key] = setTimeLeft;

      return function () {
        if (Time[key] === setTimeLeft) {
          delete Time[key];
        }
      };
    },
    [name],
  );

  const moreThenHour = timeLeft / 3600 >= 1;

  const fadeInAndOut = useCallback(
    function () {
      if (!blinkActiveRef.current) {
        return;
      }

      fadeAnimation.stopAnimation();
      fadeAnimation.setValue(0);

      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [fadeAnimation],
  );

  useEffect(
    function () {
      let animationInterval;

      if (isPaused && isActive) {
        blinkActiveRef.current = true;

        animationInterval = setInterval(function () {
          if (blinkActiveRef.current) {
            fadeInAndOut();
          }
        }, 1000);
      }

      if (!isPaused || !isActive) {
        blinkActiveRef.current = false;
        clearInterval(animationInterval);

        fadeAnimation.stopAnimation(() => fadeAnimation.setValue(1));
      }

      return () => {
        blinkActiveRef.current = false;
        clearInterval(animationInterval);

        fadeAnimation.stopAnimation(() => fadeAnimation.setValue(1));
      };
    },
    [fadeInAndOut, isPaused, isActive, fadeAnimation],
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
    <Animated.View
      style={{
        opacity: fadeAnimation,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        allowFontScaling={false}
        style={[
          {
            fontSize: 110,
            fontWeight: WEIGHT.bold,
            color: Colors.primaryTint90,
            textAlign: "center",
            width: "100%",
          },
          moreThenHour && {
            fontSize: 74,
          },
        ]}
      >
        {formatTime(timeLeft)}
      </Text>
    </Animated.View>
  );
}
