import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";

import pb from "../util/pocketbase";

import type { RecordModel } from "pocketbase";

type ChannelProps = {
  model: RecordModel;
};

export default function Channel(props: ChannelProps) {
  const [userNames, setUserNames] = useState<RecordModel[]>([]);
  const [latestMessageUser, setLatestMessageUser] =
    useState<RecordModel | null>(null);

  useEffect(() => {
    if (props.model.users.length !== 0) {
      pb.collection("user_names")
        .getFullList({
          filter: `"${props.model.users.join(",")}" ~ id`,
          requestKey: `channel-${props.model.id}-user-names`,
        })
        .then((names) => {
          setUserNames(
            names.filter((name) => name.id !== pb.authStore.model?.id),
          );
        })
        .catch((e) => {
          console.error("Error fetching user names:");
          console.error(Object.entries(e));
        });
    }
  }, [props.model.users]);

  useEffect(() => {
    if (props.model.expand?.latestMessage?.user) {
      pb.collection("user_names")
        .getOne(props.model.expand?.latestMessage?.user)
        .then(setLatestMessageUser)
        .catch((e) => {
          console.error("Error fetching latest message user name:");
          console.error(Object.entries(e));
        });
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

  if (userNames.length === 0 || !latestMessageUser?.name) {
    return null;
  }

  return (
    <View className="mb-1 flex h-1/6 w-full flex-row items-start justify-start px-5 py-2">
      <Image
        source={userNames[0].avatarUrl}
        className="mr-2 aspect-square w-1/6 rounded-full"
      />
      <View className="flex w-10/12 flex-col items-start justify-start">
        <Text className="text-xl font-bold">
          {userNames.map((n) => n.name).join(", ")}
        </Text>
        <Text className="w-full break-words text-lg">
          {latestMessageUser?.id !== authUser?.id && (
            <Text className="mr-1 text-lg font-semibold">
              {latestMessageUser?.name}:
            </Text>
          )}{" "}
          {content}
        </Text>
      </View>
    </View>
  );
}
