import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";

import pb from "../util/pocketbase";

import type { RecordModel } from "pocketbase";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  RootStackParamList,
  TabParamList,
  MessagesStackParamList,
} from "../util/pages";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MessagesStackParamList, "Channels">,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

type ChannelProps = {
  model: RecordModel;
  navigation: NavigationProp;
};

export default function Channel(props: ChannelProps) {
  const [userNames, setUserNames] = useState<RecordModel[]>([]);
  const [latestMessage, setLatestMessage] = useState<RecordModel | null>(null);
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

    pb.collection("latest_messages")
      .getFirstListItem(`id = "${props.model.id}"`)
      .then((lm) => {
        setLatestMessage(lm);

        pb.collection("user_names")
          .getOne(lm.user)
          .then(setLatestMessageUser)
          .catch((e) => {
            console.error("Error fetching latest message user name:");
            console.error(Object.entries(e));
          });
      });
  }, [props.model.users]);

  const authUser = pb.authStore.model;
  if (!authUser) {
    return null;
  }

  let content = (latestMessage?.content as string) ?? "Unable to load message";

  if (content.length > 50) {
    content = content.slice(0, 47) + "...";
  }

  if (userNames.length === 0 || !latestMessageUser?.name) {
    return null;
  }

  return (
    <TouchableOpacity
      className="w-full"
      onPress={() => {
        props.navigation.navigate("Channel", { channelId: props.model.id });
      }}
    >
      <View className="flex flex-col items-center justify-center py-2 pl-5 pr-8">
        <View className="mb-4 flex w-full flex-row items-start justify-start ">
          <Image
            source={userNames[0].avatarUrl}
            className="mr-3 aspect-square w-1/6 rounded-full"
          />
          <View className="flex w-10/12 flex-col items-start justify-start">
            <Text className="text-xl font-bold">
              {userNames.map((n) => n.name).join(", ")}
            </Text>
            <Text className="w-full break-words text-lg">
              <Text className="mr-1 text-lg font-semibold">
                {latestMessageUser?.id !== authUser?.id
                  ? latestMessageUser?.name
                  : "You"}
                :{" "}
              </Text>

              {content}
            </Text>
          </View>
        </View>
        <View
          className="w-full bg-gray-300"
          style={{
            height: 1,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
