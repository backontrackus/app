import { View, Text, Image } from "react-native";
import { useState, useEffect } from "react";
import * as Sentry from "@sentry/react-native";
// @ts-ignore
import { MarkdownView } from "react-native-markdown-view";
import { useColorScheme } from "nativewind";

import { getTimeString } from "@/util/dateUtils";
import pb, { type Message, type User, type UserName } from "@/util/pocketbase";
import { getAvatarUrl } from "@/util/avatar";

type MessageProps = {
  message: Message;
  user: User;
};

export default function Message({ message, user }: MessageProps) {
  const [publicUser, setPublicUser] = useState<UserName | null>(null);
  const { colorScheme } = useColorScheme();

  if (!user) {
    return null;
  }

  useEffect(() => {
    pb.collection("user_names")
      .getOne(message.user, {
        requestKey: `user-name-${message.user}-message-${message.id}`,
      })
      .then(setPublicUser)
      .catch(Sentry.captureException);
  }, [message.user]);

  return (
    <View
      key={message.id}
      className="mb-2 flex w-full flex-row items-end justify-start"
    >
      {message.user !== user.id && (
        <Image
          source={{ uri: publicUser ? getAvatarUrl(publicUser) : undefined }}
          width={40}
          height={40}
          style={{ marginRight: 5, borderRadius: 9999 }}
        />
      )}
      <View className="flex w-full flex-col items-start justify-start">
        <View
          className={`flex w-full flex-row items-center gap-x-1 ${
            message.user === user.id ? "justify-end" : "justify-start"
          }`}
        >
          {message.user !== user.id && (
            <Text className="text-black dark:text-white">
              {publicUser?.name}
            </Text>
          )}
          <Text className="text-gray-800 dark:text-gray-400">
            {getTimeString(new Date(message.created))}
          </Text>
        </View>
        <View
          className={`rounded-md px-2 ${
            message.user === user.id
              ? "self-end rounded-br-none bg-blue-200 dark:bg-blue-800"
              : "self-start rounded-bl-none bg-gray-200 dark:bg-gray-700"
          }`}
          style={{ maxWidth: "75%" }}
        >
          <MarkdownView
            styles={{
              paragraph: {
                color: colorScheme === "dark" ? "white" : "black",
                fontSize: 18,
                lineHeight: 22,
              },
            }}
          >
            {message.content}
          </MarkdownView>
        </View>
      </View>
    </View>
  );
}
