import { useState, useEffect } from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import Confirmation from "@/components/confirmation";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "@/util/pages";
import type { RecordModel } from "pocketbase";
import pb from "@/util/pocketbase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Account">,
  NativeStackScreenProps<RootStackParamList>
>;

const AccountPage = ({ navigation }: Props) => {
  const [location, setLocation] = useState<RecordModel | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const user = pb.authStore.model;

  useEffect(() => {
    if (user) {
      pb.collection("locations")
        .getOne(user.location)
        .then((location) => {
          setLocation(location);
        });
    }
  }, [user]);

  return (
    <View className="relative h-full w-full">
      <Confirmation
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        question="Are you sure you want to delete your account?"
        yesCallback={() => {
          pb.collection("users").delete(pb.authStore.model?.id);
          pb.authStore.clear();
          navigation.navigate("Home");
        }}
      />
      <View className="z-10 flex h-full items-center justify-center">
        <View className="bg-light-gray h-24 w-24 rounded-full">
          <Image
            source={{ uri: user?.avatarUrl }}
            className="h-24 w-24 rounded-full"
          />
        </View>

        <Text className="mt-2 text-lg font-bold">{user?.name}</Text>
        <Text className="mt-2 text-lg">{location?.name}</Text>

        <TouchableOpacity
          className="mt-4 w-1/2 flex-row items-center rounded-md bg-gray-500 p-2"
          onPress={() =>
            Clipboard.setStringAsync(
              `${process.env.EXPO_PUBLIC_POCKETBASE_URL}/${location?.id}.ics`,
            )
          }
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={24}
            color="black"
            className="h-5 w-5"
          />
          <Text className="flex-1 text-center text-lg text-white">
            Copy Calendar URL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 w-1/2 flex-row items-center rounded-md bg-gray-500 p-2"
          onPress={() => navigation.navigate("Setup", { logout: true })}
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={24}
            color="black"
            className="h-5 w-5"
          />
          <Text className="flex-1 text-center text-lg text-white">
            Change Location
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 w-1/2 flex-row items-center rounded-md bg-red-600 p-2"
          onPress={() => {
            pb.authStore.clear();
            navigation.navigate("Home");
          }}
        >
          <MaterialCommunityIcons
            name="exit-to-app"
            size={24}
            color="black"
            className="h-5 w-5"
          />
          <Text className="flex-1 text-center text-lg text-white">Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 w-1/2 flex-row items-center rounded-md bg-red-600 p-2"
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="trash-can"
            size={24}
            color="black"
            className="h-5 w-5"
          />
          <Text className="flex-1 text-center text-lg text-white">
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AccountPage;
