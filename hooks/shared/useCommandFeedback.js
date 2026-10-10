import { useCallback } from "react";

import { useSettingsData } from "../../context/VoiceRecognizerContext";
import { SUCCESS_CHIME_GAP } from "../../utils/config";
import { sleep } from "../../utils/helpers";
import { useSound } from "./useSound";
import { useSpeak } from "./useSpeak";

// One rhythm for every voice command: the success chime plays first as the
// instant "I heard you" ack, a short gap lets it land, then the spoken detail
// follows. Keeping it in one place means the whole app chimes the same way and
// the gap is tuned in exactly one spot (config.SUCCESS_CHIME_GAP) instead of
// being scattered across handlers.
export function useCommandFeedback() {
  const { successSound } = useSettingsData();
  const { playSoundGeneral } = useSound();
  const { speak } = useSpeak();

  const chimeThenSpeak = useCallback(
    async function (text) {
      await playSoundGeneral({ fileName: successSound, shouldStop: false });
      await sleep(SUCCESS_CHIME_GAP);
      await speak(text);
    },
    [playSoundGeneral, successSound, speak],
  );

  return { chimeThenSpeak };
}
