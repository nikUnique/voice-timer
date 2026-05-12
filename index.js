import { registerRootComponent } from "expo";
import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

if (!__DEV__) {
  console.log = function () {};
  console.warn = function () {};
  console.error = function () {};
  console.info = function () {};
}

registerRootComponent(App);
