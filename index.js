import { registerRootComponent } from "expo";
import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

// Text.defaultProps = Text.defaultProps || {};
// Text.defaultProps.allowFontScaling = false;

// TextInput.defaultProps = TextInput.defaultProps || {};
// TextInput.defaultProps.allowFontScaling = false;

// if (!__DEV__) {
//   console.log = function () {};
//   console.warn = function () {};
//   console.error = function () {};
//   console.info = function () {};
// }

registerRootComponent(App);
