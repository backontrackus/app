import { useState, useEffect } from "react";
import { Alert, Modal, Pressable, Text, View, Image } from "react-native";
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
        className="absolute h-full w-full top-0 left-0 bg-gray-800 opacity-80 z-30"
        style={{
          display: modalVisible ? undefined : "none",
        }}
      ></View>
      <View className="flex justify-center items-center h-full z-10">
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View className="flex justify-center items-center h-full">
            <View className="m-20 bg-white rounded-lg p-35 items-center shadow-md p-4">
              <Text className="mb-15 text-center text-xl mb-2 font-semibold">
                Are you sure you want to delete your account?
              </Text>
              <View className="flex flex-row justify-evenly items-center gap-x-2">
                <Pressable
                  className="rounded-lg px-10 py-3 shadow-md bg-red-600"
                  onPress={() => {
                    pb.collection("users").delete(pb.authStore.model?.id);
                    pb.authStore.clear();
                    navigation.navigate("Home");
                  }}
                >
                  <Text className="text-white font-bold text-center text-lg">
                    Yes
                  </Text>
                </Pressable>
                <Pressable
                  className="rounded-lg px-10 py-3 shadow-md bg-gray-500"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-bold text-center text-lg">
                    No
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View className="w-24 h-24 rounded-full bg-light-gray">
          <Image
            source={{ uri: user?.avatarUrl }}
            className="w-24 h-24 rounded-full"
          />
        </View>

        <Text className="text-lg mt-2 font-bold">{user?.name}</Text>
        <Text className="text-lg mt-2">{location}</Text>

        <Pressable
          className="bg-gray-500 rounded-md flex-row items-center p-2 mt-4 w-1/2"
          onPress={() => navigation.navigate("Setup", { logout: true })}
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
        </Pressable>

        <Pressable
          className="bg-red-600 rounded-md flex-row items-center p-2 mt-2 w-1/2"
          onPress={() => {
            pb.authStore.clear();
            navigation.navigate("Home");
          }}
        >
          <MaterialCommunityIcons
            name="exit-to-app"
            size={24}
            color="black"
            className="w-5 h-5"
          />
          <Text className="text-white text-lg text-center flex-1">Log Out</Text>
        </Pressable>

        <Pressable
          className="bg-red-600 rounded-md flex-row items-center p-2 mt-2 w-1/2"
          onPress={() => setModalVisible(true)}
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
        </Pressable>
      </View>
    </View>
  );
};

export default AccountPage;
