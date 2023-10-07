import {
  TouchableOpacity,
  View,
  Text,
  Image,
  Linking,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../util/pages";
import pb from "../util/pocketbase";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Image style={styles.lucas} source={require("../assets/lucas.jpg")} />
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.30)", "rgba(0, 0, 0, 0.40)", "black"]}
        style={styles.gradient}
      />
      <Image style={styles.logo} source={require("../assets/logo.png")} />
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
              console.log({ ...err });
            });

          console.log(userData);
        }}
        style={styles.login}
      >
        <Image style={styles.google} source={require("../assets/google.png")} />
        <Text style={styles.text}>Log in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
    padding: 8,
    alignItems: "center",
    position: "relative",
    height: "100%",
    flex: -1,
    justifyContent: "flex-end",
    gap: 10,
  },
  login: {
    backgroundColor: "#F90",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 20,
    flex: -1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  gradient: {
    width: "110%",
    height: "110%",
    zIndex: 10,
    position: "absolute",
    top: 0,
  },
  lucas: {
    zIndex: 0,
    top: 0,
    position: "absolute",
  },
  logo: {
    height: 128,
    width: 128,
    zIndex: 20,
  },
  google: {
    height: 40,
    width: 40,
    zIndex: 20,
  },
});
