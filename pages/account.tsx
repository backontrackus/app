import { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../util/pages";
import pb from "../util/pocketbase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Account">,
  NativeStackScreenProps<RootStackParamList>
>;

const AccountPage = ({ navigation }: Props) => {
  const [location, setLocation] = useState<String | null>(null);
  const user = pb.authStore.model;

  useEffect(() => {
    if (user) {
      pb.collection("locations")
        .getOne(user.location)
        .then((location) => {
          setLocation(location?.name);
        });
    }
  }, [user]);

  const handleLocationChange = () => {
    navigation.navigate("Setup", { logout: true });
  };

  const handleLogout = () => {
    pb.authStore.clear();
    navigation.navigate("Home");
  };

  const handleDeleteAccount = () => {
    pb.collection("users").delete(pb.authStore.model?.id);
    pb.authStore.clear();
    navigation.navigate("Home");
  };

  return (
    <View className="flex justify-center items-center h-full">
      <View className="w-24 h-24 rounded-full bg-light-gray">
        <Image
          source={{ uri: user?.avatarUrl }}
          className="w-24 h-24 rounded-full"
        />
      </View>

      <Text className="text-lg mt-2 font-bold">{user?.name}</Text>
      <Text className="text-lg mt-2">{location}</Text>

      <TouchableOpacity
        className="bg-gray-500 rounded-md flex-row items-center p-2 mt-4 w-1/2"
        onPress={handleLocationChange}
      >
        <MaterialCommunityIcons
          name="map-marker"
          size={24}
          color="black"
          className="w-5 h-5"
        />
        <Text className="text-white text-lg text-center flex-1">
          Change Location
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-red-500 rounded-md flex-row items-center p-2 mt-2 w-1/2"
        onPress={handleLogout}
      >
        <MaterialCommunityIcons
          name="exit-to-app"
          size={24}
          color="black"
          className="w-5 h-5"
        />
        <Text className="text-white text-lg text-center flex-1">Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-red-500 rounded-md flex-row items-center p-2 mt-2 w-1/2"
        onPress={handleDeleteAccount}
      >
        <MaterialCommunityIcons
          name="trash-can"
          size={24}
          color="black"
          className="w-5 h-5"
        />
        <Text className="text-white text-lg text-center flex-1">
          Delete Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountPage;
