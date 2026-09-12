import { NativeModules, PermissionsAndroid } from "react-native";

function requireModule(name) {
  const module = NativeModules[name];
  if (!module) {
    console.warn(`${name} native module not found - did you rebuild the app?`);
  }

  return module;
}

const CallModule = requireModule("CallModule");

export async function callNumber(phoneNumber) {
  if (!CallModule) return false;
  if (
    !phoneNumber ||
    typeof phoneNumber !== "string" ||
    phoneNumber.trim() === ""
  ) {
    console.warn("callNumber: invalid phone number", phoneNumber);
    return false;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    {
      title: "Phone call permission",
      message: "This lets the app place calls on your behalf.",
    },
  );

  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    return false;
  }

  try {
    await CallModule.makeCall(phoneNumber);
    return true;
  } catch (err) {
    console.warn("makeCall failed:", err.message);
    return false;
  }
}
