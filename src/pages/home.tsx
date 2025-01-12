import { TouchableOpacity, View, Text, Image, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { getLoadedFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/util/pages";
import pb from "@/util/pocketbase";
import { oswald } from "@/util/fonts";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  function checkAuth(model: any) {
    if (model) {
      if (pb.authStore.isValid !== true) {
        pb.authStore.clear();
        return;
      }

      Sentry.setUser({
        id: pb.authStore.model?.id,
        username: pb.authStore.model?.username,
        email: pb.authStore.model?.email,
        ip_address: "{{auto}}",
        name: pb.authStore.model?.name,
      });

      if (model.location) {
        navigation.navigate("Main", {});
      } else {
        navigation.navigate("Setup", { logout: false });
      }
    }
  }

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      checkAuth(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  checkAuth(pb.authStore.model);

  return (
    <View className="relative h-full flex-1 flex-col items-center justify-end">
      <StatusBar backgroundColor="black" style="light" />
      <View className="absolute bottom-0 z-20 flex-1 flex-col items-center justify-end">
        <View className="my-2 flex flex-row items-center justify-between gap-x-2">
          <Image
            className="z-20 aspect-square w-24"
            source={require("../assets/logo.png")}
          />
          <Text
            className="w-fit text-center text-3xl text-white"
            style={{
              fontFamily: oswald,
            }}
          >
            Back on Track{"\n"}America
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            Sentry.addBreadcrumb({
              type: "auth",
              category: "login",
              level: "info",
            });

            let userData;

            try {
              userData = await pb.collection("users").authWithOAuth2({
                provider: "google",
                urlCallback: async (url) => {
                  WebBrowser.openAuthSessionAsync(url);
                },
              });
            } catch (e) {
              // @ts-expect-error
              console.error(e.originalError);
              Sentry.captureException(e);
            }

            if (userData) {
              const avatarUrl = userData?.meta?.avatarUrl;
              const name = userData?.meta?.name;

              Sentry.setUser({
                id: pb.authStore.model?.id,
                username: pb.authStore.model?.username,
                email: pb.authStore.model?.email,
                ip_address: "{{auto}}",
                name,
              });

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
          className={`z-20 flex flex-1 flex-row items-center rounded-md bg-bot-orange px-5 py-2 ${
            Platform.OS === "ios" ? "mb-10" : ""
          }`}
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
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.30)", "rgba(0, 0, 0, 0.40)", "black"]}
        className="absolute bottom-0 z-10 h-full w-full"
      />
      <Image
        className="absolute bottom-0 z-0 h-full"
        source={require("../assets/lucas.jpg")}
      />
    </View>
  );
}
