import { TouchableOpacity, View, Text, Image, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../util/pages";
import pb from "../util/pocketbase";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  if (pb.authStore.model) {
    if (pb.authStore.model?.location) {
      navigation.navigate("Main");
    } else {
      navigation.navigate("Setup", { logout: false });
    }
  }

  return (
    <View className="items-center flex-1 h-screen relative justify-end gap-5 flex-col">
      <Image
        className="top-0 absolute z-0"
        source={require("../assets/lucas.jpg")}
      />
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.30)", "rgba(0, 0, 0, 0.40)", "black"]}
        className="top-0 absolute z-10 w-full h-full"
      />
      <View className="absolute bottom-0 flex-1 flex-col justify-end items-center py-2">
        <Image
          className="w-32 aspect-square z-20"
          source={require("../assets/logo.png")}
        />
        <TouchableOpacity
          onPress={async () => {
            const userData = await pb
              .collection("users")
              .authWithOAuth2({
                provider: "google",
                urlCallback: async (url) => {
                  Linking.openURL(url);
                },
              })
              .catch((err) => {
                console.error(err);
              });

            if (userData) {
              const avatarUrl = userData?.meta?.avatarUrl;
              const name = userData?.meta?.name;
              pb.collection("users").update(pb?.authStore?.model?.id, {
                avatarUrl,
                name,
              });

              if (pb.authStore.model?.location) {
                navigation.navigate("Main");
              } else {
                navigation.navigate("Setup", { logout: false });
              }
            }
          }}
          className="bg-bot-orange rounded-md py-2 px-5 z-20 flex flex-1 flex-row items-center"
        >
          <Image
            className="w-10 h-10 aspect-square mr-2"
            source={require("../assets/google.png")}
          />
          <Text className="text-2xl font-bold text-center">
            Log in with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
