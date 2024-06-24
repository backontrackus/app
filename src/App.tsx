import { useState, useEffect, useRef } from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootSiblingParent } from "react-native-root-siblings";
import { registerRootComponent } from "expo";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useColorScheme } from "nativewind";
import * as Sentry from "@sentry/react-native";
import { ExtraErrorData } from "@sentry/integrations";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./pages/home";
import SetupScreen from "./pages/setup";
import MainScreen from "./pages/main";
import NewAnnouncement from "./pages/newAnnouncement";

import type { RootStackParamList } from "./util/pages";
import type { NavigationContainerRef } from "@react-navigation/native";

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
    // @ts-expect-error
    new ExtraErrorData(),
  ],
  environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT,
});

const Stack = createNativeStackNavigator<RootStackParamList>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

function App() {
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
  const { colorScheme } = useColorScheme();
  const [expoPushToken, setExpoPushToken] =
    useState<Notifications.ExpoPushToken>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token),
    );
  }, []);

  return (
    <SafeAreaProvider>
      <RootSiblingParent>
        <NavigationContainer
          ref={navigationRef}
          theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          onReady={() => {
            routingInstrumentation.registerNavigationContainer(navigationRef);
          }}
        >
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Setup"
              component={SetupScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
              initialParams={{ expoPushToken }}
            />
            <Stack.Screen
              name="NewAnnouncement"
              component={NewAnnouncement}
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </RootSiblingParent>
    </SafeAreaProvider>
  );
}

registerRootComponent(Sentry.wrap(App));
