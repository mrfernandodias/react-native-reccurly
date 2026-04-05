const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround for a Metro validation warning triggered by Expo's generated config.
if (config.watcher && "unstable_workerThreads" in config.watcher) {
  delete config.watcher.unstable_workerThreads;
}

module.exports = withNativewind(config);
