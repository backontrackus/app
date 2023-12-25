import { TouchableOpacity, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/util/pages";
import pb from "@/util/pocketbase";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  if (pb.authStore.model) {
    if (pb.authStore.model?.location) {
      navigation.navigate("Main", {});
    } else {
      navigation.navigate("Setup", { logout: false });
    }
  }

  return (
    <View className="relative h-screen flex-1 flex-col items-center justify-end gap-5">
      <Image
        className="absolute top-0 z-0"
        source={require("../assets/lucas.jpg")}
      />
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.30)", "rgba(0, 0, 0, 0.40)", "black"]}
        className="absolute top-0 z-10 h-full w-full"
      />
      <View className="absolute bottom-0 flex-1 flex-col items-center justify-end py-2">
        <Image
          className="z-20 aspect-square w-32"
          source={require("../assets/logo.png")}
        />
        <TouchableOpacity
          onPress={async () => {
            const userData = await pb
              .collection("users")
              .authWithOAuth2({
                provider: "google",
                urlCallback: async (url) => {
                  WebBrowser.openAuthSessionAsync(url);
                },
              })
              .catch((err) => {
                console.error(Object.entries(err));
              });

            if (userData) {
              const avatarUrl = userData?.meta?.avatarUrl;
              const name = userData?.meta?.name;
              pb.collection("users").update(pb?.authStore?.model?.id, {
                avatarUrl,
                name,
              });

              if (pb.authStore.model?.location) {
                navigation.navigate("Main", {});
              } else {
                navigation.navigate("Setup", { logout: false });
              }
            }
          }}
          className="z-20 flex flex-1 flex-row items-center rounded-md bg-bot-orange px-5 py-2"
        >
          <Image
            className="mr-2 aspect-square h-10 w-10"
            source={require("../assets/google.png")}
          />
          <Text className="text-center text-2xl font-bold">
            Log in with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
