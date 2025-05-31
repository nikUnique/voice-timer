import { useCallback, useRef } from "react";
import Sound from "react-native-sound";
import { Vibration } from "react-native";

import {
  useSettingsData,
  useSoundData,
} from "../context/VoiceRecognizerContext";

function useSound() {
  const vibrationIntervalRef = useRef(null);
  const { soundRef, shortSoundRef, soundIsPlayingRef, alertTimeoutRef } =
    useSoundData();

  const { alarmVolume, isVibrating, autoStopAlarmTimeout, successSound } =
    useSettingsData();

  function startVibration() {
    Vibration.vibrate();
    vibrationIntervalRef.current = setInterval(() => {
      Vibration.vibrate();
    }, 1000);
  }

  function stopVibration() {
    clearInterval(vibrationIntervalRef.current);
    Vibration.cancel();
  }

  const loadSound = useCallback(
    async function loadSound(fileName, isLooping) {
      await new Promise((resolve, reject) => {
        const alarm = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.error("Error handling sound", error);
            reject(error);
            return;
          }

          if (isLooping) {
            soundRef.current = alarm;
          }
          if (!isLooping) {
            shortSoundRef.current = alarm;
          }

          resolve("success");
        });
      });
    },
    [shortSoundRef, soundRef]
  );

  const playSoundGeneral = useCallback(
    async function ({
      fileName,
      isLooping = false,
      volume = 1,
      isVibrating = false,
    }) {
      try {
        if (isLooping) {
          Sound.setCategory("Alarm", true);
        }

        if (!isLooping) {
          Sound.setCategory("Playback", true);
        }

        const alarmSoundLoaded = soundRef.current?.isLoaded?.();
        const shortSoundLoaded = shortSoundRef.current?.isLoaded?.();

        if (
          !soundRef.current ||
          !shortSoundRef.current ||
          !alarmSoundLoaded ||
          !shortSoundLoaded
        ) {
          await loadSound(fileName, isLooping);
        }

        if (isLooping && soundRef.current) {
          soundRef.current?.setNumberOfLoops(-1);
          soundRef.current?.setVolume(volume);

          if (isVibrating) {
            startVibration();
          }

          soundRef.current?.play((success) => {
            // console.log("Sound should have started now 💯");

            if (success) {
              // console.log("Sound started playing");

              soundRef.current.release();
            } else {
              console.error(
                "Playback of alarm sound failed to audio decoding errors 🔈"
              );
            }
          });
        }

        if (!isLooping && shortSoundRef.current) {
          shortSoundRef.current?.setVolume(volume);
          shortSoundRef.current?.play((success) => {
            if (success) {
              // shortSoundRef.current.release();
            } else {
              console.error("Playback failed to audio decoding errors 🔈");
            }
          });
        }
      } catch (err) {
        console.error("An error occured in playSound function 🎱", err);
      }
    },
    [soundRef, shortSoundRef, loadSound]
  );

  const playSound = useCallback(
    async function ({
      fileName,
      isLooping,
      volume,
      shouldStop = true,
      isVibrating,
      duration,
    }) {
      try {
        if (duration) {
          clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = null;

          alertTimeoutRef.current = setTimeout(function () {
            async function waitTimer() {
              await stopSound();
            }
            waitTimer();
          }, duration * 1000);
        }

        if (soundIsPlayingRef.current && shouldStop) {
          return;
        }

        if (shouldStop) {
          soundIsPlayingRef.current = true;
        }

        await playSoundGeneral({ fileName, isLooping, volume, isVibrating });
      } catch (e) {
        console.error("Error loading sound: 🏸", e);
      }
    },
    [soundIsPlayingRef, playSoundGeneral, alertTimeoutRef, stopSound]
  );

  const stopSound = useCallback(
    async function stopSound() {
      if (soundRef.current) {
        stopVibration();
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
        soundIsPlayingRef.current = false;
        // soundRef.current.release();
        soundRef.current?.stop();
      }

      // console.log("super");
      let count = 0;

      // setInterval(function () {
      //   count++;
      //   console.log("superCount", count);

      //   playSoundGeneral({ fileName: successSound });
      // }, 1500);
    },
    [soundRef, alertTimeoutRef, soundIsPlayingRef, playSound]
  );

  return { playSoundGeneral, playSound, stopSound };
}

export { useSound };
