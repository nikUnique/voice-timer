import { useCallback, useRef } from "react";
import { NativeModules, Vibration } from "react-native";
import Sound from "react-native-sound";

import {
  useRefsData,
  useSoundData,
} from "../../context/VoiceRecognizerContext";

function useSound() {
  const alarmSoundObjectRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const { soundRef, shortSoundRef, soundIsPlayingRef, alertTimeoutRef } =
    useSoundData();
  const { isMediaPausedRef, isListeningRef, isMediaPausedManuallyRef } =
    useRefsData();

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

        // Diagnostic: surface the reload decision so a silently-dead (released)
        // native player can be caught. After release() the JS object survives but
        // the native player is gone; if isLoaded() wrongly reports true we would
        // skip reloading and play() on a dead player (no sound, no error).
        console.log(
          `[sound] play ${fileName} loop=${isLooping} soundRef=${Boolean(
            soundRef.current,
          )} shortRef=${Boolean(shortSoundRef.current)} alarmLoaded=${alarmSoundLoaded} shortLoaded=${shortSoundLoaded}`,
        );

        if (
          !soundRef.current ||
          !shortSoundRef.current ||
          !alarmSoundLoaded ||
          !shortSoundLoaded
        ) {
          console.log(`[sound] reloading ${fileName}`);
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
              // Null the ref so the next play() reliably reloads instead of
              // reusing a released (dead native) player.
              soundRef.current = null;
              alarmSoundObjectRef.current = null;
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
              shortSoundRef.current = null;
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
          soundRef.current = null;
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
            !isMediaPausedManuallyRef.current
          ) {
            NativeModules.AudioFocusModule.releaseAudioFocus();
          }
          stopVibration();
          clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = null;
          soundIsPlayingRef.current = false;
          soundRef.current?.stop();
        } else {
          // Even without a live sound object, clear the timeout and reset the
          // guard so a stuck true can't silently block the next alarm.
          stopVibration();
          clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = null;
          soundIsPlayingRef.current = false;
        }
      } catch (error) {
        console.error("Error stopping sound", error);
      }
    },
    [
      soundRef,
      isMediaPausedRef,
      isListeningRef,
      isMediaPausedManuallyRef,
      alertTimeoutRef,
      soundIsPlayingRef,
    ],
  );

  return { playSoundGeneral, playSound, stopSound, playSpecial };
}

export { useSound };
