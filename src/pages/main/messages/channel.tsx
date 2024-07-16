import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useCallback, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import pb from "@/util/pocketbase";
import Message from "@/components/message";

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
  const nextPageRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstPageReceived, setIsFirstPageReceived] = useState(false);
  const [messages, setMessages] = useState<RecordModel[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [width, setWidth] = useState(0);

  const user = pb.authStore.model;
  if (!user) {
    navigation.navigate("Home");
    return null;
  }

  const fetchMessages = (erase: boolean) => {
    setIsLoading(true);

    Sentry.addBreadcrumb({
      type: "pb-fetch",
      category: "messages",
      level: "info",
    });

    pb.collection("messages")
      .getList(erase ? 1 : nextPageRef.current, 15, {
        filter: `"${route.params.channelId}" ~ channel`,
        sort: "-created",
      })
      .then((res) => {
        setMessages(erase ? res.items : [...messages, ...res.items]);
        nextPageRef.current =
          res.page == res.totalPages ? undefined : res.page + 1;
        setIsLoading(false);
        !isFirstPageReceived && setIsFirstPageReceived(true);
      })
      .catch(Sentry.captureException);
  };

  const refresh = useCallback(() => {
    fetchMessages(true);

    Sentry.addBreadcrumb({
      type: "pb-fetch",
      category: "channels",
      level: "info",
    });

    pb.collection("channels")
      .getOne(route.params.channelId)
      .then((channel) => {
        navigation.setOptions({
          title: channel.title,
        });
      })
      .catch(Sentry.captureException);
  }, [user, route.params.channelId]);

  useFocusEffect(refresh);

  const ListEndLoader = () => {
    if (!isFirstPageReceived && isLoading) {
      return <ActivityIndicator size={"large"} />;
    }
  };

  if (!isFirstPageReceived && isLoading) {
    return <ActivityIndicator size={"small"} />;
  }

  return (
    <SafeAreaView
      className="relative h-full w-full pt-2"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <FlatList
        data={messages}
        renderItem={({ item: message }) => (
          <View style={{ width }} className="px-2">
            <Message key={message.id} message={message} user={user} />
          </View>
        )}
        onEndReached={() => {
          if (nextPageRef.current === undefined) {
            return;
          }
          fetchMessages(false);
        }}
        onEndReachedThreshold={0.8}
        ListFooterComponent={ListEndLoader}
        className="flex flex-col px-2"
        contentContainerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
        }}
        inverted
        onRefresh={refresh}
        refreshing={isLoading}
      />
      <View className="pt-14" />
      <View className="absolute bottom-0 flex flex-row items-center justify-center gap-x-2 px-4 py-2">
        <TextInput
          placeholderTextColor={"gray"}
          className="flex-1 rounded-xl border-2 border-black bg-white px-2 py-1 text-lg dark:bg-zinc-900 dark:text-white"
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={() => {
            Sentry.addBreadcrumb({
              type: "pb-create",
              category: "messages",
              level: "info",
            });

            pb.collection("messages")
              .create({
                channel: route.params.channelId,
                user: user.id,
                content: newMessage,
              })
              .then(() => {
                refresh();
              })
              .catch(Sentry.captureException);

            setNewMessage("");
          }}
          className="rounded-full bg-bot-blue-1 p-2"
        >
          <MaterialCommunityIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
