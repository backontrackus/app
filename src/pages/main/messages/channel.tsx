import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useCallback, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// @ts-ignore
import { MarkdownView } from "react-native-markdown-view";

import pb from "@/util/pocketbase";
import { getTimeString } from "@/util/dateUtils";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  RootStackParamList,
  TabParamList,
  MessagesStackParamList,
} from "@/util/pages";
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
  const [newMessage, setNewMessage] = useState<string>("");

  const scrollViewRef = useRef<ScrollView>(null);

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
    <View className="relative h-full pt-2">
      <ScrollView
        className="flex h-full flex-col px-2"
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "flex-start",
        }}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className="mb-2 flex w-full flex-col items-start justify-start"
          >
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
              className={`w-3/4 rounded-md px-2 ${
                message.user === user.id
                  ? "self-end rounded-br-none bg-blue-200"
                  : "self-start rounded-bl-none bg-gray-200"
              }`}
            >
              <MarkdownView
                styles={{
                  paragraph: {
                    color: "black",
                    fontSize: 18,
                    lineHeight: 22,
                  },
                }}
              >
                {message.content}
              </MarkdownView>
            </View>
          </View>
        ))}
        <View className="pt-14" />
      </ScrollView>
      <View className="absolute bottom-0 flex flex-row items-center justify-center gap-x-2 px-4 py-2">
        <TextInput
          className="flex-1 rounded-xl border-2 border-black bg-white px-2 py-1 text-lg"
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={() => {
            pb.collection("messages")
              .create({
                channel: route.params.channelId,
                user: user.id,
                content: newMessage,
              })
              .then(() => {
                refresh();
              })
              .catch(console.error);

            setNewMessage("");
          }}
          className="rounded-full bg-bot-blue-1 p-2"
        >
          <MaterialCommunityIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
