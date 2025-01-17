import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { Image, BackHandler, Platform, TouchableOpacity } from "react-native";
import React, { useEffect, useCallback, useState } from "react";
import * as Sentry from "@sentry/react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnnouncementsPage from "./main/announcements";
import MessagesPage from "./main/messages";
import AccountPage from "./main/account";
import pb from "@/util/pocketbase";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, TabParamList } from "@/util/pages";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [isLeader, setIsLeader] = useState(false);

  const user = pb.authStore.record;
  const location = user?.location;

  useEffect(() => {
    if (!user) return;
    if (!route.params?.expoPushToken) return;

    Sentry.addBreadcrumb({
      type: "pb-fetch",
      category: "devices",
      level: "info",
    });

    pb.collection("devices")
      .getFirstListItem(`token ~ "${route.params.expoPushToken?.data}"`)
      .catch(async () => {
        Sentry.addBreadcrumb({
          type: "pb-create",
          category: "devices",
          level: "info",
        });

        const device = await pb.collection("devices").create({
          token: route.params.expoPushToken?.data,
        });

        Sentry.addBreadcrumb({
          type: "pb-update",
          category: "users",
          level: "info",
        });

        pb.collection("users")
          .update(user.id, {
            devices: [...user.devices, device.id],
          })
          .catch(Sentry.captureException);
      });
  }, [route.params.expoPushToken, user]);

  useEffect(() => {
    if (location) {
      Sentry.addBreadcrumb({
        type: "pb-fetch",
        category: "locations",
        level: "info",
      });

      pb.collection("locations")
        .getOne(location)
        .then((locationData) => {
          if (locationData.leaders.includes(user.id)) {
            setIsLeader(true);
          } else {
            setIsLeader(false);
          }
        })
        .catch(Sentry.captureException);
    }
  }, [user]);

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
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            height: 60 + insets.bottom,
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
        <Tab.Screen
          name="Announcements"
          component={AnnouncementsPage}
          options={{
            headerRight: () => {
              if (!isLeader) return null;
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewAnnouncement", {});
                  }}
                  style={{
                    marginRight: 10,
                  }}
                >
                  <AntDesign
                    name="pluscircleo"
                    size={24}
                    color="#F90"
                    className="h-5 w-5"
                  />
                </TouchableOpacity>
              );
            },
          }}
        />
        <Tab.Screen name="Messages" component={MessagesPage} />
        <Tab.Screen name="Account" component={AccountPage} />
      </Tab.Navigator>
    </>
  );
}
