import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";

import pb from "../util/pocketbase";

import type { RecordModel } from "pocketbase";

type ChannelProps = {
  model: RecordModel;
  isLeader: boolean;
};

export default function Channel(props: ChannelProps) {
  const [user, setUser] = useState<RecordModel | null>(null);
  const [latestMessageUser, setLatestMessageUser] =
    useState<RecordModel | null>(null);

  useEffect(() => {
    if (props.model.user && props.isLeader) {
      pb.collection("user_names").getOne(props.model.user).then(setUser);
    }
  }, [props.model.user, props.isLeader]);

  useEffect(() => {
    if (props.model.expand?.latestMessage?.user) {
      pb.collection("user_names")
        .getOne(props.model.expand?.latestMessage?.user)
        .then(setLatestMessageUser);
    }
  }, [props.model.expand?.latestMessage?.user]);

  const authUser = pb.authStore.model;
  if (!authUser) {
    return null;
  }

  const latestMessage = props.model.expand?.latestMessage;
  let content = (latestMessage?.content as string) ?? "Unable to load message";

  if (content.length > 50) {
    content = content.slice(0, 47) + "...";
  }

  if (
    (props.model.user && props.isLeader && !user?.name) ||
    !latestMessageUser?.name
  ) {
    return null;
  }

  return (
    <View className="flex h-1/5 w-full flex-col items-center justify-start p-5">
      <View className="flex w-full flex-row items-start justify-start">
        <Image
          source={
            props.isLeader ? user?.avatarUrl : require("../assets/logo.png")
          }
          className="mr-2 aspect-square w-1/6 rounded-full"
        />
        <View className="flex w-10/12 flex-col items-start justify-start">
          <Text className="text-xl font-bold">
            {props.isLeader
              ? user?.name ?? "Unknown"
              : `Back On Track @ ${
                  props.model.expand?.location?.name ?? "Unknown"
                }`}
          </Text>
          <Text className="w-full break-words text-lg">
            {latestMessageUser?.id === authUser?.id
              ? content
              : `${latestMessageUser?.name}: ${content}`}
          </Text>
        </View>
      </View>
      <View className="m-2 h-1 w-11/12 self-center justify-self-end rounded-md bg-gray-300" />
    </View>
  );
}
