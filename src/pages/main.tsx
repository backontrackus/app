import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";

import AnnouncementsPage from "./main/announcements";
import MessagesPage from "./main/messages";
import AccountPage from "./main/account";
import pb from "@/util/pocketbase";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, TabParamList } from "@/util/pages";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainScreen({ navigation }: Props) {
  const user = pb.authStore.model;
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
