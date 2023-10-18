import { View, Text, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import pb from "../../../util/pocketbase";
import { getTimeString } from "../../../util/dateUtils";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  RootStackParamList,
  TabParamList,
  MessagesStackParamList,
} from "../../../util/pages";
import type { RecordModel } from "pocketbase";

type Props = CompositeScreenProps<
  NativeStackScreenProps<MessagesStackParamList, "Channel">,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export default function ChannelPage({ navigation, route }: Props) {
  const [messages, setMessages] = useState<RecordModel[]>([]);

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const refresh = useCallback(() => {
    pb.collection("channels")
      .getOne(route.params.channelId)
      .then((channel) => {
        if (channel.users.includes(user.id)) {
          pb.collection("user_names")
            .getFullList({
              filter: `"${channel.users
                .filter((u: RecordModel) => u !== user.id)
                .join(",")}" ~ id`,
            })
            .then((userNames) => {
              navigation.setOptions({
                title: userNames.map((un) => un.name).join(", "),
              });
            });
        } else {
          navigation.navigate("Messages");
        }
      })
      .catch((e) => {
        console.error("Error fetching channel:");
        console.error(Object.entries(e));
      });

    pb.collection("messages")
      .getFullList({
        filter: `"${route.params.channelId}" ~ channel`,
        expand: "user",
      })
      .then((msgs) => {
        setMessages(
          msgs.sort(
            (a, b) =>
              new Date(a.created).valueOf() - new Date(b.created).valueOf(),
          ),
        );
      });
  }, [user, route.params.channelId]);

  useFocusEffect(refresh);

  return (
    <ScrollView
      className="flex h-full flex-col px-2 py-3"
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {messages.map((message) => (
        <View className="mb-2 flex w-full flex-col items-start justify-start">
          <View
            className={`flex w-full flex-row items-center gap-x-1 ${
              message.user === user.id
                ? "justify-end pr-2"
                : "justify-start pl-2"
            }`}
          >
            {message.user !== user.id && (
              <Text>{message.expand?.user.name}</Text>
            )}
            <Text className="text-gray-800">
              {getTimeString(new Date(message.created))}
            </Text>
          </View>
          <View
            className={`w-3/4 rounded-md p-2 ${
              message.user === user.id
                ? "self-end rounded-br-none bg-blue-200"
                : "self-start rounded-bl-none bg-gray-200"
            }`}
          >
            <Text
              className="text-lg"
              style={{
                lineHeight: 22,
              }}
            >
              {message.content}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
