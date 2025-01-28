import { useState, useEffect } from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useColorScheme } from "nativewind";
import * as Sentry from "@sentry/react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Confirmation from "@/components/confirmation";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "@/util/pages";
import type { RecordModel } from "pocketbase";
import pb from "@/util/pocketbase";
import { getAvatarUrl } from "@/util/avatar";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Account">,
  NativeStackScreenProps<RootStackParamList>
>;

const AccountPage = ({ navigation }: Props) => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [location, setLocation] = useState<RecordModel | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const user = pb.authStore.record;

  useEffect(() => {
    if (user) {
      pb.collection("locations")
        .getOne(user.location)
        .then((location) => {
          setLocation(location);
        });
    }
  }, [user]);

  useEffect(() => {
    AsyncStorage.setItem("colorScheme", colorScheme ?? "light");
  }, [colorScheme]);

  return (
    <SafeAreaView className="relative h-full w-full">
      <Confirmation
        modalVisible={deleteModalVisible}
        setModalVisible={setDeleteModalVisible}
        question="Are you sure you want to delete your account?"
        yesCallback={() => {
          pb.collection("users").delete(pb.authStore.record?.id);
          pb.authStore.clear();
          navigation.navigate("Home");
        }}
      />
      <Confirmation
        modalVisible={locationModalVisible}
        setModalVisible={setLocationModalVisible}
        question="Are you sure you want to change your location? You will be signed out after changing your location."
        yesCallback={() => {
          navigation.navigate("Setup", { logout: true });
        }}
      />
      <View className="z-10 flex h-full items-center justify-center">
        <View className="bg-light-gray h-24 w-24 rounded-full">
          <Image
            source={{
              uri: getAvatarUrl(user),
            }}
            className="h-24 w-24 rounded-full"
          />
        </View>

        <Text className="mt-2 text-lg font-bold dark:text-white">
          {user?.name}
        </Text>
        <Text className="mt-2 text-lg dark:text-white">{location?.name}</Text>

        <TouchableOpacity
          className="mt-4 w-7/12 flex-row items-center rounded-md bg-gray-500 p-2"
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
          className="mt-2 w-7/12 flex-row items-center rounded-md bg-gray-500 p-2"
          onPress={() => setLocationModalVisible(true)}
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
          className="mt-2 w-7/12 flex-row items-center rounded-md bg-gray-500 p-2"
          onPress={() => {
            toggleColorScheme();
          }}
        >
          <MaterialIcons
            name={colorScheme === "dark" ? "light-mode" : "dark-mode"}
            size={24}
            color="black"
          />
          <Text className="flex-1 text-center text-lg text-white">
            Switch to {colorScheme === "dark" ? "Light Mode" : "Dark Mode"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 w-7/12 flex-row items-center rounded-md bg-red-600 p-2"
          onPress={() => {
            Sentry.setUser(null);
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
          className="mt-2 w-7/12 flex-row items-center rounded-md bg-red-600 p-2"
          onPress={() => setDeleteModalVisible(true)}
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
    </SafeAreaView>
  );
};

export default AccountPage;
