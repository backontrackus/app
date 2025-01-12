import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Back On Track",
  slug: "bot-app",
  version: "1.0.0",
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
    bundleIdentifier: "org.backontrackus.mobile",
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
  plugins: [
    [
      "@sentry/react-native/expo",
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "node_modules/@expo-google-fonts/oswald/Oswald_600SemiBold.ttf",
        ],
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          // Network inspector breaks react-native-sse
          networkInspector: false,
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "a3af5358-9a31-49de-83c4-38cfc632784b",
    },
  },
});
