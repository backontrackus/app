import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Back On Track",
  slug: "bot-app",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "org.backontrackus.app",
    infoPlist: {
      NSCalendarsUsageDescription:
        "This app requires access to your calendar to add events from your location's announcements.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "org.backontrackus.app",
    googleServicesFile: "./google-services.json",
  },
  web: {
    favicon: "./src/assets/favicon.png",
  },
  plugins: ["sentry-expo"],
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      },
    ],
  },
  extra: {
    eas: {
      projectId: "a3af5358-9a31-49de-83c4-38cfc632784b",
    },
  },
});
