import { callNumber, endCall } from "../../../utils/nativeHelpers";
import { hasPhrase, normalize } from "../../../utils/helpers";
import { CALL_TIMEOUT, PHONE_TIMEOUT } from "../../../utils/config";
import {
  useContactsData,
  useRefsData,
  useSettingsData,
} from "../../../context/VoiceRecognizerContext";
import { useSpeak } from "../../shared/useSpeak";
import { NativeModules } from "react-native";

let callTimeout, callId;

export function useCallConfirmationFlow() {
  const { recognizedCommandRef, prevRecognizedCommandRef, commandsRef } =
    useRefsData();

  const { speak } = useSpeak();
  const { CALL, SHORT_CALL, YES, NO } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { isVoiceFeedbackEnabled, permitAnswerCallsRef } = useSettingsData();

  const { contacts } = useContactsData();

  function isCallOrShortCall(command) {
    return hasPhrase(command, CALL) || hasPhrase(command, SHORT_CALL);
  }

  // The "Make and answer calls with voice" switch in Settings. Read the ref at
  // dispatch time so flipping it takes effect on the next utterance. The
  // Commands screen already marks call and short call unavailable when this is
  // off, so the handlers have to agree with it or the screen is lying.
  function isCallPermissionOff() {
    return permitAnswerCallsRef?.current !== true;
  }

  function findContact(command) {
    return contacts.find((contact) =>
      hasPhrase(command, normalize(contact.name)),
    );
  }

  async function startConfirmation() {
    clearTimeout(callTimeout);

    if (
      !isCallOrShortCall(recognizedCommandRef.current) ||
      !isVoiceFeedbackEnabled ||
      isCallPermissionOff()
    ) {
      return false;
    }

    const contactToCall = findContact(recognizedCommandRef.current);

    // if (!contactToCall) {
    //   await speak("I didn't recognize that contact.");
    //   return true;
    // }

    // The spoken example has to contain the command phrase exactly, because
    // handleYes matches it with hasPhrase against the command. "short call"
    // sits naturally inside "make a short call to", but "call" cannot be
    // lengthened the same way, so the two halves are chosen separately.
    const isShortCall = hasPhrase(recognizedCommandRef.current, SHORT_CALL);
    const action = isShortCall ? SHORT_CALL : CALL;
    const wants = isShortCall ? "make a short call to" : "call";
    await speak(
      `Are you sure you want to ${wants} ${contactToCall.name}? Say "yes, ${action} ${contactToCall.name}" to confirm.`,
    );

    callTimeout = setTimeout(async function () {
      prevRecognizedCommandRef.current = null;
      await speak("Never mind, didn't hear you in time.");
    }, CALL_TIMEOUT);

    prevRecognizedCommandRef.current = recognizedCommandRef.current;
    return true;
  }

  async function handleYes() {
    const command = recognizedCommandRef.current;
    const pending = prevRecognizedCommandRef.current;

    if (
      !hasPhrase(command, YES) ||
      !isCallOrShortCall(pending) ||
      !isVoiceFeedbackEnabled ||
      isCallPermissionOff()
    ) {
      return false;
    }

    clearTimeout(callTimeout);

    const contactToCall = findContact(pending);

    if (!contactToCall) {
      prevRecognizedCommandRef.current = null;
      await speak("Track was lost of who to call.");
      return true;
    }

    const wasShortCall = hasPhrase(pending, SHORT_CALL);
    const actionWord = wasShortCall ? SHORT_CALL : CALL;

    const confirmsAction = hasPhrase(command, actionWord);
    const confirmsName = hasPhrase(command, normalize(contactToCall.name));

    if (!confirmsAction || !confirmsName) {
      prevRecognizedCommandRef.current = null;
      await speak("Okay, cancelled.");
      return true;
    }

    const action = wasShortCall ? "Making a short call to" : "Calling";

    await speak(`${action} ${contactToCall.name}.`);
    callNumber(contactToCall.phoneNumber);

    clearTimeout(callId);
    if (wasShortCall) {
      callId = setTimeout(async function () {
        const isMicInUseByOtherApp =
          await NativeModules.AudioFocusModule.isMicInUse();
        console.log(isMicInUseByOtherApp, "Is mic in use?");

        endCall();
      }, PHONE_TIMEOUT);
    }

    prevRecognizedCommandRef.current = null;
    return true;
  }

  async function handleNo() {
    if (
      !hasPhrase(recognizedCommandRef.current, NO) ||
      !isCallOrShortCall(prevRecognizedCommandRef.current)
    ) {
      return false;
    }

    clearTimeout(callTimeout);
    prevRecognizedCommandRef.current = null;
    await speak("Okay, cancelled.");
    return true;
  }

  return { startConfirmation, handleYes, handleNo };
}
