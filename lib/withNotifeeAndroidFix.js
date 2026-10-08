const { withProjectBuildGradle } = require("expo/config-plugins");

const notifeeAndroidWorkaroundCode = `    maven {
        url "$rootDir/../node_modules/@notifee/react-native/android/libs"
    }`;

module.exports = (expoConfig) => {
  return withProjectBuildGradle(expoConfig, (config) => {
    const contents = config.modResults.contents;

    // Don't add the repository twice.
    if (
      contents.includes(
        'url "$rootDir/../node_modules/@notifee/react-native/android/libs"',
      )
    ) {
      return config;
    }

    const anchor = /maven\s*\{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*\}/;

    if (!anchor.test(contents)) {
      throw new Error(
        "Could not find the JitPack Maven repository in android/build.gradle",
      );
    }

    config.modResults.contents = contents.replace(
      anchor,
      (match) => `${match}\n${notifeeAndroidWorkaroundCode}`,
    );

    return config;
  });
};
