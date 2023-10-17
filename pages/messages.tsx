import { View } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import pb from "../util/pocketbase";
import Channel from "../components/channel";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, TabParamList } from "../util/pages";
import type { RecordModel } from "pocketbase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Messages">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MessagesPage({ navigation }: Props) {
  const [channels, setChannels] = useState<RecordModel[]>([]);

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const refresh = useCallback(() => {
    pb.collection("channels")
      .getList(1, 20, {
        expand: "users,latestMessage",
      })
      .then((res) => {
        console.log(res.items);
        setChannels(res.items);
      })
      .catch((e) => {
        console.error("Error fetching channels:");
        console.error(Object.entries(e));
      });
  }, [user]);

  useFocusEffect(refresh);

  return (
    <View className="flex h-full flex-col items-center justify-start py-3">
      {channels.map((channel) => (
        <Channel key={channel.id} model={channel} />
      ))}
    </View>
  );
}
