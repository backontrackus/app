import { TouchableOpacity, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../pages";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="h-full relative">
      <Image
        className="absolute h-full w-full top-0 z-10"
        source={require("../assets/lucas.jpg")}
      />
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.30)", "rgba(0, 0, 0, 0.40)", "black"]}
        className="h-screen w-screen z-20"
      />
      <View className="text-5xl flex-1 flex-col h-96 gap-2 justify-end items-center z-20">
        <Image source={require("..s/assets/logo.png")} />
        <TouchableOpacity
          onPress={() => {
            // sign in with google
          }}
          className="rounded-md bg-orange-500 px-2 py-4 mb-10 flex h-16 flex-row justify-center items-center"
        >
          <Image
            className="w-10 h-10 m-0"
            source={require("./assets/google.png")}
          />
          <Text className="text-2xl ml-2 text-center h-min text-black font-bold">
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
