import { useCallback, useRef } from "react";
import { AppState, NativeModules, Vibration } from "react-native";
import Sound from "react-native-sound";

import { useRefsData, useSoundData } from "../context/VoiceRecognizerContext";
import Tts from "react-native-tts";
import { useAppState } from "./useAppState";

function useSound() {
  const alarmSoundObjectRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const { soundRef, shortSoundRef, soundIsPlayingRef, alertTimeoutRef } =
    useSoundData();
  const { isMediaPausedRef, isListeningRef, isMediaPausedManuallyRef } =
    useRefsData();
  const { appStateRef } = useAppState();

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
            alarmSoundObjectRef.current = alarm;
          }
          if (!isLooping) {
            shortSoundRef.current = alarm;
          }

          resolve("success");
        });
      });
    },
    [shortSoundRef],
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

        if (
          fileName.toLowerCase() === "joy.mp3" &&
          soundRef.current?.isPlaying()
        ) {
          await stopSound();
        }

        const alarmSoundLoaded = alarmSoundObjectRef.current?.isLoaded?.();
        const shortSoundLoaded = shortSoundRef.current?.isLoaded?.();

        if (
          !soundRef.current ||
          !shortSoundRef.current ||
          !alarmSoundLoaded ||
          !shortSoundLoaded
        ) {
          await loadSound(fileName, isLooping);
        }

        if (fileName.toLowerCase() === "joy.mp3") {
          soundRef.current = alarmSoundObjectRef.current;
        }

        if (isLooping && soundRef.current) {
          soundRef.current?.setNumberOfLoops(-1);
          soundRef.current?.setVolume(volume);

          if (isVibrating) {
            startVibration();
          }

          soundRef.current?.play((success) => {
            if (success) {
              soundRef.current.release();
            } else {
              console.error(
                "Playback of alarm sound failed to audio decoding errors 🔈",
              );
            }
          });
        }

        if (!isLooping && shortSoundRef.current) {
          shortSoundRef.current?.setVolume(volume);
          shortSoundRef.current?.play((success) => {
            if (success) {
              shortSoundRef.current.release();
            } else {
              console.error("Playback failed to audio decoding errors 🔈");
            }
          });
        }
      } catch (err) {
        console.error("An error occurred in playSound function 🎱", err);
      }
    },
    [soundRef, shortSoundRef, stopSound, loadSound],
  );

  const playSpecial = useCallback(
    async function ({ fileName }) {
      Sound.setCategory("Playback", true);
      await new Promise((resolve, reject) => {
        const alarm = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.error("Error handling sound", error);
            reject(error);
            return;
          }

          if (!soundRef.current?.isPlaying()) {
            soundRef.current = alarm;

            resolve("success");
          }
        });
      });

      soundRef.current?.play((success) => {
        if (success) {
          soundRef.current.release();
        } else {
          console.error(
            "Playback of disco sound failed to audio decoding errors 🔈",
          );
        }
      });
    },
    [soundRef],
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

        NativeModules.AudioFocusModule.requestAudioFocus(async (granted) => {
          if (granted) {
            console.log();
          }
        });
        await playSoundGeneral({
          fileName,
          isLooping,
          volume,
          isVibrating,
        });
      } catch (e) {
        console.error("Error loading sound: 🏸", e);
      }
    },
    [soundIsPlayingRef, playSoundGeneral, alertTimeoutRef, stopSound],
  );

  const stopSound = useCallback(
    async function stopSound() {
      try {
        if (soundRef.current) {
          if (
            !isMediaPausedRef.current &&
            isListeningRef.current &&
            !isMediaPausedManuallyRef.current /* ||
            AppState.currentState !== "active" */
          ) {
            console.log(AppState.currentState, "appState in sound");
            console.log(isMediaPausedManuallyRef, " isMediaPausedManuallyRef");

            NativeModules.AudioFocusModule.releaseAudioFocus();
          }
          stopVibration();
          clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = null;
          soundIsPlayingRef.current = false;
          soundRef.current?.stop();
        }
      } catch (error) {
        console.error("Error stopping sound", error);
      }
    },
    [
      soundRef,
      isMediaPausedRef,
      isListeningRef,
      alertTimeoutRef,
      soundIsPlayingRef,
    ],
  );

  return { playSoundGeneral, playSound, stopSound, playSpecial };
}

export { useSound };
