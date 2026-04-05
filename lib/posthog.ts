import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

// Loaded from app.config.js extras → process.env at build time
const apiKey =
  typeof Constants.expoConfig?.extra?.posthogProjectToken === "string"
    ? Constants.expoConfig.extra.posthogProjectToken.trim()
    : undefined;
const host =
  typeof Constants.expoConfig?.extra?.posthogHost === "string"
    ? Constants.expoConfig.extra.posthogHost.trim()
    : undefined;
const isPostHogConfigured = Boolean(apiKey);

if (__DEV__) {
  console.log('[posthog]', { configured: isPostHogConfigured });
}

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  host: host || undefined,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});
