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
  const { CALL, PHONE, YES, NO } = commandsRef?.current
    ? commandsRef.current
    : {};

  const { isVoiceFeedbackEnabled } = useSettingsData();

  const { contacts } = useContactsData();

  function isCallOrPhone(command) {
    return hasPhrase(command, CALL) || hasPhrase(command, PHONE);
  }

  function findContact(command) {
    return contacts.find((contact) =>
      hasPhrase(command, normalize(contact.name)),
    );
  }

  async function startConfirmation() {
    clearTimeout(callTimeout);

    if (
      !isCallOrPhone(recognizedCommandRef.current) ||
      !isVoiceFeedbackEnabled
    ) {
      return false;
    }

    const contactToCall = findContact(recognizedCommandRef.current);

    // if (!contactToCall) {
    //   await speak("I didn't recognize that contact.");
    //   return true;
    // }

    const action = hasPhrase(recognizedCommandRef.current, PHONE)
      ? "phone"
      : "call";
    await speak(
      `Are you sure you want to ${action} ${contactToCall.name}? Say "yes, ${action} ${contactToCall.name}" to confirm.`,
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
      !isCallOrPhone(pending) ||
      !isVoiceFeedbackEnabled
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

    const wasPhone = hasPhrase(pending, PHONE);
    const actionWord = wasPhone ? PHONE : CALL;

    const confirmsAction = hasPhrase(command, actionWord);
    const confirmsName = hasPhrase(command, normalize(contactToCall.name));

    if (!confirmsAction || !confirmsName) {
      prevRecognizedCommandRef.current = null;
      await speak("Okay, cancelled.");
      return true;
    }

    const action = wasPhone ? "Phoning" : "Calling";

    await speak(`${action} ${contactToCall.name}.`);
    callNumber(contactToCall.phoneNumber);

    clearTimeout(callId);
    if (wasPhone) {
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
      !isCallOrPhone(prevRecognizedCommandRef.current)
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
