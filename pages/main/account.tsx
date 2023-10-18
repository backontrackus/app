import { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  TouchableOpacity,
  Text,
  View,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../../util/pages";
import pb from "../../util/pocketbase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Account">,
  NativeStackScreenProps<RootStackParamList>
>;

const AccountPage = ({ navigation }: Props) => {
  const [location, setLocation] = useState<String | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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

  return (
    <View className="relative h-full w-full">
      <View
        className="absolute left-0 top-0 z-30 h-full w-full bg-gray-800 opacity-80"
        style={{
          display: modalVisible ? undefined : "none",
        }}
      ></View>
      <View className="z-10 flex h-full items-center justify-center">
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View className="flex h-full items-center justify-center">
            <View className="p-35 m-20 items-center rounded-lg bg-white p-4 shadow-md">
              <Text className="mb-15 mb-2 text-center text-xl font-semibold">
                Are you sure you want to delete your account?
              </Text>
              <View className="flex flex-row items-center justify-evenly gap-x-2">
                <TouchableOpacity
                  className="rounded-lg bg-red-600 px-10 py-3 shadow-md"
                  onPress={() => {
                    pb.collection("users").delete(pb.authStore.model?.id);
                    pb.authStore.clear();
                    navigation.navigate("Home");
                  }}
                >
                  <Text className="text-center text-lg font-bold text-white">
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-lg bg-gray-500 px-10 py-3 shadow-md"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-center text-lg font-bold text-white">
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View className="bg-light-gray h-24 w-24 rounded-full">
          <Image
            source={{ uri: user?.avatarUrl }}
            className="h-24 w-24 rounded-full"
          />
        </View>

        <Text className="mt-2 text-lg font-bold">{user?.name}</Text>
        <Text className="mt-2 text-lg">{location}</Text>

        <TouchableOpacity
          className="mt-4 w-1/2 flex-row items-center rounded-md bg-gray-500 p-2"
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
