import { View, Text, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../util/pages";
import type { RecordModel } from "pocketbase";
import pb from "../util/pocketbase";

type Props = NativeStackScreenProps<RootStackParamList, "Setup">;

export default function SetupScreen({ navigation, route }: Props) {
  const [locations, setLocations] = useState<RecordModel[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<String | null>();

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  useEffect(() => {
    pb.collection("locations")
      .getFullList()
      .then((newLocations) => {
        setLocations(newLocations);
      })
      .catch((err) => {});
  }, []);

  return (
    <View className="bg-bot-blue-1 h-screen flex-1 flex-col relative justify-center items-center">
      <Image
        className="w-32 aspect-square z-20"
        source={require("../assets/logo.png")}
      />
      <Text className="text-white text-center text-4xl font-bold">
        Hi {user.name.split(" ")[0]}, welcome to Back On Track!
      </Text>
      <Text className="text-white text-center text-2xl">
        Select your location to continue:
      </Text>
      <Picker
        accessibilityLabel="Select your location"
        selectedValue={selectedLocationId}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedLocationId(itemValue)
        }
        prompt="Select your location"
        mode="dialog"
        style={{
          width: "80%",
          backgroundColor: "white",
          marginVertical: 15,
        }}
        dropdownIconColor="black"
        dropdownIconRippleColor="#F90"
      >
        {locations
          .sort((a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0))
          .map((location) => (
            <Picker.Item
              key={location.id}
              label={location.name}
              value={location.id}
              style={{ backgroundColor: "white", fontSize: 18 }}
            />
          ))}
      </Picker>
      <TouchableOpacity
        className="bg-bot-orange rounded-md py-2 px-5 my-2"
        disabled={!selectedLocationId}
        onPress={() => {
          if (selectedLocationId) {
            pb.collection("users").update(user.id, {
              location: selectedLocationId,
            });

            if (route.params.logout) {
              pb.authStore.clear();
              navigation.navigate("Home");
            } else {
              navigation.navigate("Main");
            }
          }
        }}
      >
        <Text className="text-2xl font-semibold text-center">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
