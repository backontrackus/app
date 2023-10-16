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
  const [isLeader, setIsLeader] = useState(false);

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const location = user.location;

  useEffect(() => {
    if (location) {
      pb.collection("locations")
        .getOne(location)
        .then((locationData) => {
          if (locationData.leaders.includes(user.id)) {
            setIsLeader(true);
          } else {
            setIsLeader(false);
          }
        });
    }
  }, [user]);

  const refresh = useCallback(() => {
    pb.collection("channels")
      .getList(1, 20, {
        expand: "location,latestMessage",
      })
      .then((res) => {
        setChannels(res.items);
      });
  }, [user]);

  useFocusEffect(refresh);

  return (
    <View className="h-full">
      {channels.map((channel) => (
        <Channel key={channel.id} model={channel} isLeader={isLeader} />
      ))}
    </View>
  );
}
