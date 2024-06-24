import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, BackHandler } from "react-native";
import { useEffect, useCallback } from "react";
import * as Sentry from "sentry-expo";
import { useFocusEffect } from "@react-navigation/native";

import AnnouncementsPage from "./main/announcements";
import MessagesPage from "./main/messages";
import AccountPage from "./main/account";
import pb from "@/util/pocketbase";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, TabParamList } from "@/util/pages";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainScreen({ navigation, route }: Props) {
  const user = pb.authStore.model;

  useEffect(() => {
    if (!user) return;
    if (!route.params?.expoPushToken) return;

    Sentry.Native.addBreadcrumb({
      type: "pb-fetch",
      category: "devices",
      level: "info",
    });

    pb.collection("devices")
      .getFirstListItem(`token ~ "${route.params.expoPushToken?.data}"`)
      .catch(async () => {
        Sentry.Native.addBreadcrumb({
          type: "pb-create",
          category: "devices",
          level: "info",
        });

        const device = await pb.collection("devices").create({
          token: route.params.expoPushToken?.data,
        });

        Sentry.Native.addBreadcrumb({
          type: "pb-update",
          category: "users",
          level: "info",
        });

        pb.collection("users")
          .update(user.id, {
            devices: [...user.devices, device.id],
          })
          .catch(Sentry.Native.captureException);
      });
  }, [route.params.expoPushToken, user]);

  // disable the back button
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

      return () => subscription.remove();
    }, []),
  );

  if (!user) {
    navigation.navigate("Home");
    return null;
  }
  if (!user.location) {
    navigation.navigate("Setup", { logout: false });
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          marginBottom: 5,
        },
        headerTitleStyle: {
          fontSize: 25,
          fontWeight: "bold",
        },
        tabBarIcon: ({ focused, color, size: oldSize }) => {
          let iconName;
          const size = oldSize + 5;

          switch (route.name) {
            case "Announcements":
              iconName = "bullhorn";
              break;
            case "Messages":
              iconName = "android-messages";
              break;
            case "Account":
              return (
                <Image
                  source={{ uri: user.avatarUrl }}
                  width={size}
                  height={size}
                  style={{ marginTop: 5, borderRadius: 9999 }}
                />
              );
          }

          return (
            <MaterialCommunityIcons
              // @ts-ignore
              name={iconName}
              size={size}
              color={color}
              style={{ marginTop: 5 }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Announcements" component={AnnouncementsPage} />
      <Tab.Screen name="Messages" component={MessagesPage} />
      <Tab.Screen name="Account" component={AccountPage} />
    </Tab.Navigator>
  );
}
