import { View } from "react-native";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../util/pages";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Messages">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MessagesPage({ navigation }: Props) {
  return <View></View>;
}
